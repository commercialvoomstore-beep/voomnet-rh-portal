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
      return NextResponse.json({ success: false, error: 'Database connection URL not configured', employees: [] }, { status: 200 });
    }

    let rows: any[] = [];
    try {
      rows = await sql`
        SELECT id, matricule, first_name, last_name, email, phone, role, position, department, status, base_salary, hire_date, avatar_url
        FROM employees
        ORDER BY created_at DESC;
      `;
    } catch (err) {
      rows = await sql`
        SELECT id, matricule, first_name, last_name, email, phone, role, position, department, status
        FROM employees;
      `;
    }

    const employees = rows.map((r: any) => {
      const s = String(r.status || '').toUpperCase();
      const mappedStatut = (s === 'CDI' || s === 'ACTIF' ? 'CDI' : s === 'STAGIAIRE' || s === 'STAGE' ? 'STAGIAIRE' : 'CDD') as 'CDI' | 'CDD' | 'STAGIAIRE';
      return {
        id: String(r.id || `emp-${Date.now()}`),
        matricule: String(r.matricule || '1000'),
        nom: String(r.last_name || ''),
        prenom: String(r.first_name || ''),
        email: String(r.email || ''),
        telephone3CX: String(r.phone || r.matricule || ''),
        role: r.role === 'SUPERADMIN' ? 'SuperAdmin' : r.role === 'ADMIN' ? 'Admin' : 'Employé',
        poste: String(r.position || 'Poste VOOMNET'),
        departement: String(r.department || 'Général'),
        statut: mappedStatut,
        soldeConges: 24,
        salaireBase: Number(r.base_salary) || 350000,
        dateEmbauche: r.hire_date ? new Date(r.hire_date).toISOString().substring(0, 10) : '2023-01-01',
        avatar: r.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        motDePasse: String(r.password || 'voomnet2026'),
        contactUrgence: String(r.phone || ''),
      };
    });

    return NextResponse.json({ success: true, employees }, { status: 200 });
  } catch (err: any) {
    console.error('API GET /api/employees error:', err);
    return NextResponse.json({ success: false, error: err.message, employees: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customUrl, ...emp } = body;
    const sql = getDbConnection(customUrl);

    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database connection URL not configured' }, { status: 200 });
    }

    const roleDb = emp.role === 'SuperAdmin' ? 'SUPERADMIN' : (emp.role === 'Admin' || emp.role === 'Admin RH') ? 'ADMIN' : 'EMPLOYEE';
    const statutDb = emp.statut === 'CDI' ? 'CDI' : emp.statut === 'STAGIAIRE' ? 'STAGIAIRE' : 'CDD';

    await sql`
      INSERT INTO employees (matricule, first_name, last_name, email, phone, role, position, department, status, base_salary, hire_date, avatar_url)
      VALUES (
        ${emp.matricule},
        ${emp.prenom || ''},
        ${emp.nom || ''},
        ${emp.email || `${emp.matricule}@voomnet.com`},
        ${emp.telephone3CX || emp.telephonePerso || ''},
        ${roleDb},
        ${emp.poste || 'Employé'},
        ${emp.departement || 'Support'},
        ${statutDb},
        ${emp.salaireBase || 350000},
        ${emp.dateEmbauche || '2023-01-01'},
        ${emp.avatar || ''}
      )
      ON CONFLICT (matricule) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        position = EXCLUDED.position,
        department = EXCLUDED.department,
        status = EXCLUDED.status,
        base_salary = EXCLUDED.base_salary;
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('API POST /api/employees error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
