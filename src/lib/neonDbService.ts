import { neon } from '@neondatabase/serverless';
import { getNeonConnectionString } from './neonClient';
import { Employee, ChatMessage, AbsenceRequest, StatutContrat, RoleType } from '@/data/mockData';

export const executeNeonQuery = async (queryFn: (sql: any) => Promise<any>) => {
  const connStr = getNeonConnectionString();
  if (!connStr || !connStr.startsWith('postgres')) {
    console.warn('Neon Connection String not set. Falling back to local state.');
    return null;
  }
  try {
    const sql = neon(connStr);
    return await queryFn(sql);
  } catch (err) {
    console.error('Neon SQL Query Error:', err);
    throw err;
  }
};

// ==========================================
// 1. EMPLOYEES CRUD
// ==========================================
export const fetchNeonEmployees = async (): Promise<Employee[] | null> => {
  return executeNeonQuery(async (sql) => {
    const rows = await sql`
      SELECT id, matricule, first_name, last_name, email, phone, role, position, department, status, base_salary, hire_date, avatar_url, password
      FROM employees
      ORDER BY created_at DESC;
    `;
    return rows.map((r: any) => ({
      id: String(r.id || `emp-${Date.now()}`),
      matricule: String(r.matricule || '1000'),
      nom: String(r.last_name || ''),
      prenom: String(r.first_name || ''),
      email: String(r.email || ''),
      telephone3CX: String(r.phone || r.matricule || ''),
      role: (r.role === 'SUPERADMIN' ? 'SuperAdmin' : r.role === 'ADMIN' ? 'Admin' : 'Employé') as RoleType,
      poste: String(r.position || 'Poste VOOMNET'),
      departement: String(r.department || 'Général'),
      statut: (r.status === 'ACTIF' ? 'CDI' : r.status === 'STAGIAIRE' ? 'STAGIAIRE' : 'CDD') as StatutContrat,
      soldeConges: 24,
      salaireBase: Number(r.base_salary) || 350000,
      dateEmbauche: r.hire_date ? new Date(r.hire_date).toISOString().substring(0, 10) : '2023-01-01',
      avatar: r.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      motDePasse: String(r.password || 'voomnet2026'),
    }));
  });
};

export const insertNeonEmployee = async (emp: Employee) => {
  return executeNeonQuery(async (sql) => {
    const roleDb = emp.role === 'SuperAdmin' ? 'SUPERADMIN' : (emp.role === 'Admin' || (emp.role as string) === 'Admin RH') ? 'ADMIN' : 'EMPLOYEE';
    const statutDb = emp.statut || 'ACTIF';

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
  });
};

export const deleteNeonEmployee = async (id: string) => {
  return executeNeonQuery(async (sql) => {
    await sql`DELETE FROM employees WHERE id = ${id} OR matricule = ${id};`;
  });
};

// ==========================================
// 2. CHAT MESSAGES
// ==========================================
export const fetchNeonChatMessages = async (): Promise<ChatMessage[] | null> => {
  return executeNeonQuery(async (sql) => {
    const rows = await sql`
      SELECT id, sender_id, sender_name, recipient_id, recipient_name, text, delivered, delivery_status, created_at
      FROM chat_messages
      ORDER BY created_at ASC;
    `;
    return rows.map((r: any) => ({
      id: r.id,
      senderMatricule: r.sender_id,
      senderName: r.sender_name,
      recipientMatricule: r.recipient_id,
      recipientName: r.recipient_name,
      text: r.text,
      timestamp: new Date(r.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'distribue' as const,
    }));
  });
};

export const insertNeonChatMessage = async (msg: ChatMessage) => {
  return executeNeonQuery(async (sql) => {
    await sql`
      INSERT INTO chat_messages (sender_id, sender_name, recipient_id, recipient_name, text, delivered, delivery_status)
      VALUES (
        ${msg.senderMatricule},
        ${msg.senderName},
        ${msg.recipientMatricule},
        ${msg.recipientName},
        ${msg.text},
        true,
        '✓✓ Envoyé & Distribué au Poste'
      );
    `;
  });
};

// ==========================================
// 3. LEAVE / ABSENCE REQUESTS
// ==========================================
export const fetchNeonLeaveRequests = async (): Promise<AbsenceRequest[] | null> => {
  return executeNeonQuery(async (sql) => {
    const rows = await sql`
      SELECT id, employee_id, employee_name, type, start_date, end_date, days_count, reason, status
      FROM leave_requests
      ORDER BY created_at DESC;
    `;
    return rows.map((r: any) => ({
      id: r.id,
      codeSuivi: `VN-P-2026-${r.id.substring(0, 6)}`,
      matricule: r.employee_id,
      nomPrenom: r.employee_name,
      fonctionService: 'Service VOOMNET',
      dateEmbauche: '2023-01-01',
      typeAbsence: r.type === 'MALADIE' ? 'Maladie' : 'Congé annuel',
      dateDebut: r.start_date,
      dateFin: r.end_date,
      dureeJours: r.days_count,
      motif: r.reason,
      justifiee: true,
      statut: r.status === 'APPROUVE' ? 'Approuvé' : r.status === 'REFUSE' ? 'Refusé' : 'En attente',
      dateDemande: new Date().toISOString().split('T')[0],
    }));
  });
};

export const insertNeonLeaveRequest = async (req: any) => {
  return executeNeonQuery(async (sql) => {
    const typeDb = req.type === 'SANTÉ' || req.typeAbsence === 'Maladie' ? 'MALADIE' : 'CONGE_ANNUEL';
    const statusDb = req.statut === 'Approuvé' ? 'APPROUVE' : req.statut === 'Refusé' ? 'REFUSE' : 'EN_ATTENTE';

    await sql`
      INSERT INTO leave_requests (employee_id, employee_name, type, start_date, end_date, days_count, reason, status)
      VALUES (
        ${req.employeId || req.matricule},
        ${req.employeNom || req.nomPrenom},
        ${typeDb},
        ${req.dateDebut},
        ${req.dateFin},
        ${req.nombreJours || req.dureeJours || 1},
        ${req.motif},
        ${statusDb}
      );
    `;
  });
};
