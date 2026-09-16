import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_NEON_URL = 'postgresql://neondb_owner:npg_ctQ3PBZwHfT1@ep-wandering-hall-aw7ln4ss-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require';

function getDbConnection(customUrl?: string) {
  const connStr =
    customUrl ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.NEXT_PUBLIC_NEON_URL ||
    DEFAULT_NEON_URL;
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

async function ensureEmployeeTable(sql: any) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS employees (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
          matricule VARCHAR(20) UNIQUE NOT NULL,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(150) UNIQUE NOT NULL,
          phone VARCHAR(30),
          role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
          position VARCHAR(150) NOT NULL,
          department VARCHAR(150) NOT NULL,
          status VARCHAR(20) NOT NULL DEFAULT 'ACTIF',
          base_salary NUMERIC(12, 2) NOT NULL DEFAULT 350000,
          hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
          avatar_url TEXT,
          emergency_contact VARCHAR(200),
          password VARCHAR(100) DEFAULT 'voomnet2026',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(200);`;
    await sql`ALTER TABLE employees ADD COLUMN IF NOT EXISTS password VARCHAR(100);`;
  } catch (e) {
    // ignore
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

    await ensureEmployeeTable(sql);

    let rows: any[] = [];
    try {
      rows = await sql`
        SELECT id, matricule, first_name, last_name, email, phone, role, position, department, status, base_salary, hire_date, avatar_url, emergency_contact, password
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
        role: r.role
          ? r.role.toUpperCase().includes('SUPER')
            ? 'SuperAdmin'
            : r.role.toUpperCase().includes('ADMIN')
            ? 'Admin'
            : 'Employé'
          : 'Employé',
        poste: String(r.position || 'Poste VOOMNET'),
        departement: String(r.department || 'Général'),
        statut: mappedStatut,
        soldeConges: 24,
        salaireBase: Number(r.base_salary) || 350000,
        dateEmbauche: r.hire_date ? new Date(r.hire_date).toISOString().substring(0, 10) : '2023-01-01',
        avatar: r.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        motDePasse: String(r.password || 'voomnet2026'),
        contactUrgence: String(r.emergency_contact || r.contact_urgence || ''),
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

    await ensureEmployeeTable(sql);

    const roleDb = emp.role === 'SuperAdmin' ? 'SUPERADMIN' : (emp.role === 'Admin' || emp.role === 'Admin RH') ? 'ADMIN' : 'EMPLOYEE';
    const statutDb = emp.statut === 'CDI' ? 'CDI' : emp.statut === 'STAGIAIRE' ? 'STAGIAIRE' : 'CDD';

    const cleanMatricule = String(emp.matricule || '').trim();
    let cleanEmail = String(emp.email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      cleanEmail = `${cleanMatricule}@voomnet.com`;
    }

    let cleanHireDate = new Date().toISOString().split('T')[0];
    if (emp.dateEmbauche && !isNaN(Date.parse(emp.dateEmbauche))) {
      try {
        cleanHireDate = new Date(emp.dateEmbauche).toISOString().split('T')[0];
      } catch (e) {}
    }

    const cleanPassword = String(emp.motDePasse || 'voomnet2026').trim() || 'voomnet2026';

    // Check if another employee (different matricule) owns this email
    try {
      const existingEmail = await sql`
        SELECT id, matricule FROM employees WHERE LOWER(email) = ${cleanEmail} AND matricule != ${cleanMatricule};
      `;
      if (existingEmail && existingEmail.length > 0) {
        cleanEmail = `${emp.prenom ? emp.prenom.toLowerCase().charAt(0) : 'user'}.${emp.nom ? emp.nom.toLowerCase().replace(/\s+/g, '') : 'emp'}.${cleanMatricule}@voomnet.com`;
      }
    } catch (e) {
      // Ignore
    }

    const existingEmp = await sql`
      SELECT id FROM employees WHERE matricule = ${cleanMatricule} OR id = ${cleanMatricule} LIMIT 1;
    `;

    if (existingEmp && existingEmp.length > 0) {
      await sql`
        UPDATE employees
        SET
          first_name = ${emp.prenom || ''},
          last_name = ${emp.nom || ''},
          email = ${cleanEmail},
          phone = ${emp.telephone3CX || emp.telephonePerso || cleanMatricule},
          role = ${roleDb},
          position = ${emp.poste || 'Employé'},
          department = ${emp.departement || 'Support'},
          status = ${statutDb},
          base_salary = ${emp.salaireBase || 350000},
          emergency_contact = ${emp.contactUrgence || ''},
          password = ${cleanPassword},
          avatar_url = COALESCE(${emp.avatar || null}, avatar_url)
        WHERE matricule = ${cleanMatricule} OR id = ${cleanMatricule};
      `;
    } else {
      await sql`
        INSERT INTO employees (matricule, first_name, last_name, email, phone, role, position, department, status, base_salary, hire_date, avatar_url, emergency_contact, password)
        VALUES (
          ${cleanMatricule},
          ${emp.prenom || ''},
          ${emp.nom || ''},
          ${cleanEmail},
          ${emp.telephone3CX || emp.telephonePerso || cleanMatricule},
          ${roleDb},
          ${emp.poste || 'Employé'},
          ${emp.departement || 'Support'},
          ${statutDb},
          ${emp.salaireBase || 350000},
          ${cleanHireDate},
          ${emp.avatar || ''},
          ${emp.contactUrgence || ''},
          ${cleanPassword}
        );
      `;
    }

    return NextResponse.json({ success: true, email: cleanEmail }, { status: 200 });
  } catch (err: any) {
    console.error('API POST /api/employees error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const customUrl = searchParams.get('customUrl') || undefined;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing employee ID or matricule' }, { status: 400 });
    }

    const sql = getDbConnection(customUrl);
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database connection URL not configured' }, { status: 200 });
    }

    await sql`DELETE FROM employees WHERE id = ${id} OR matricule = ${id};`;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('API DELETE /api/employees error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
