import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getDbConnection(customUrl?: string) {
  const connStr =
    customUrl ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.NEXT_PUBLIC_NEON_URL ||
    '';
  if (!connStr || (!connStr.startsWith('postgres://') && !connStr.startsWith('postgresql://'))) {
    return null;
  }
  try {
    return neon(connStr);
  } catch (err) {
    console.error('Neon server connection error:', err);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customUrl = searchParams.get('customUrl') || undefined;
    const sql = getDbConnection(customUrl);

    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database connection URL not configured on server', requests: [] }, { status: 200 });
    }

    const rows = await sql`
      SELECT
        lr.id,
        lr.employee_id,
        lr.employee_name,
        lr.type,
        lr.start_date,
        lr.end_date,
        lr.days_count,
        lr.reason,
        lr.status,
        lr.approved_by,
        e.matricule AS emp_matricule
      FROM leave_requests lr
      LEFT JOIN employees e ON lr.employee_id = e.id OR lr.employee_id = e.matricule
      ORDER BY lr.created_at DESC;
    `;

    const requests = rows.map((r: any) => {
      const dbType = String(r.type || 'Permission d\'absence');
      const cleanType =
        dbType === 'Maladie' || dbType === 'SANTÉ'
          ? 'Maladie'
          : dbType === 'Congé annuel' || dbType === 'CONGÉ_PAYÉ'
          ? 'Congé annuel'
          : dbType === 'Événement familial'
          ? 'Événement familial'
          : 'Permission d\'absence';

      let resolvedMatricule = String(r.emp_matricule || r.employee_id || '1000');
      if (resolvedMatricule.length > 10 && r.employee_id && String(r.employee_id).length <= 6) {
        resolvedMatricule = String(r.employee_id);
      }

      return {
        id: String(r.id),
        codeSuivi: String(r.id).startsWith('VN-')
          ? String(r.id)
          : `VN-P-2026-${String(r.id).substring(0, 6).toUpperCase()}`,
        matricule: resolvedMatricule,
        nomPrenom: String(r.employee_name || 'Collaborateur'),
        fonctionService: 'Service VOOMNET',
        dateEmbauche: '2023-01-01',
        typeAbsence: cleanType,
        dateDebut: r.start_date ? new Date(r.start_date).toISOString().substring(0, 10) : '2026-09-10',
        dateFin: r.end_date ? new Date(r.end_date).toISOString().substring(0, 10) : '2026-09-11',
        dureeJours: Number(r.days_count) || 1,
        motif: String(r.reason || 'Demande d\'absence'),
        justifiee: r.status === 'APPROUVE',
        statut: r.status === 'APPROUVE' ? 'Approuvé' : r.status === 'REFUSE' ? 'Refusé' : 'En attente',
        dateDemande: new Date().toISOString().split('T')[0],
        cadreAdminNotes:
          r.approved_by ||
          (r.status === 'APPROUVE'
            ? 'Validé par l\'Administration RH'
            : r.status === 'REFUSE'
            ? 'Refusé par l\'Administration RH'
            : 'En attente de décision RH'),
      };
    });

    return NextResponse.json({ success: true, requests }, { status: 200 });
  } catch (err: any) {
    console.error('API GET /api/leave-requests error:', err);
    return NextResponse.json({ success: false, error: err.message, requests: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customUrl, ...req } = body;
    const sql = getDbConnection(customUrl);

    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database connection URL not configured on server' }, { status: 200 });
    }

    const typeDb = req.typeAbsence || req.type || 'Permission d\'absence';
    const statusDb = req.statut === 'Approuvé' ? 'APPROUVE' : req.statut === 'Refusé' ? 'REFUSE' : 'EN_ATTENTE';
    const targetMatricule = String(req.employeId || req.matricule || '1000');
    const targetName = String(req.employeNom || req.nomPrenom || 'Collaborateur');

    let targetEmployeeUuid: string | null = null;
    try {
      const empMatch = await sql`
        SELECT id FROM employees
        WHERE matricule = ${targetMatricule} OR id = ${targetMatricule}
        LIMIT 1;
      `;
      if (empMatch && empMatch.length > 0) {
        targetEmployeeUuid = String(empMatch[0].id);
      } else {
        const parts = targetName.split(' ');
        const prenom = parts[0] || 'Prénom';
        const nom = parts.slice(1).join(' ') || 'Nom';
        const newEmpRows = await sql`
          INSERT INTO employees (matricule, first_name, last_name, email, role, position, department, status)
          VALUES (
            ${targetMatricule},
            ${prenom},
            ${nom},
            ${`${targetMatricule}@voomnet.com`},
            'EMPLOYEE',
            'Employé VOOMNET',
            'Général',
            'ACTIF'
          )
          RETURNING id;
        `;
        if (newEmpRows && newEmpRows.length > 0) {
          targetEmployeeUuid = String(newEmpRows[0].id);
        }
      }
    } catch (e) {
      console.warn('FK resolution warning:', e);
    }

    const fkEmployeeId = targetEmployeeUuid || targetMatricule;
    const reqId = req.id || `abs-${Date.now()}`;

    let insertedRow;
    try {
      const rows = await sql`
        INSERT INTO leave_requests (id, employee_id, employee_name, type, start_date, end_date, days_count, reason, status)
        VALUES (
          ${reqId},
          ${fkEmployeeId},
          ${targetName},
          ${typeDb},
          ${req.dateDebut},
          ${req.dateFin},
          ${req.nombreJours || req.dureeJours || 1},
          ${req.motif},
          ${statusDb}
        )
        ON CONFLICT (id) DO UPDATE SET
          type = EXCLUDED.type,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          days_count = EXCLUDED.days_count,
          reason = EXCLUDED.reason,
          status = EXCLUDED.status
        RETURNING id, employee_id, employee_name, type, start_date, end_date, days_count, reason, status;
      `;
      insertedRow = rows[0];
    } catch (err) {
      const rows = await sql`
        INSERT INTO leave_requests (employee_id, employee_name, type, start_date, end_date, days_count, reason, status)
        VALUES (
          ${fkEmployeeId},
          ${targetName},
          ${typeDb},
          ${req.dateDebut},
          ${req.dateFin},
          ${req.nombreJours || req.dureeJours || 1},
          ${req.motif},
          ${statusDb}
        )
        RETURNING id, employee_id, employee_name, type, start_date, end_date, days_count, reason, status;
      `;
      insertedRow = rows[0];
    }

    return NextResponse.json({ success: true, row: insertedRow }, { status: 200 });
  } catch (err: any) {
    console.error('API POST /api/leave-requests error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, statut, notes, customUrl } = body;
    const sql = getDbConnection(customUrl);

    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database connection URL not configured on server' }, { status: 200 });
    }

    const statusDb = statut === 'Approuvé' ? 'APPROUVE' : statut === 'Refusé' ? 'REFUSE' : 'EN_ATTENTE';
    await sql`
      UPDATE leave_requests
      SET status = ${statusDb},
          approved_by = ${notes || 'Administration RH'}
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('API PUT /api/leave-requests error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const customUrl = searchParams.get('customUrl') || undefined;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing request ID' }, { status: 400 });
    }

    const sql = getDbConnection(customUrl);
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database connection URL not configured on server' }, { status: 200 });
    }

    await sql`
      DELETE FROM leave_requests
      WHERE id = ${id};
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('API DELETE /api/leave-requests error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
