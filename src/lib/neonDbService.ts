import { neon } from '@neondatabase/serverless';
import { getNeonConnectionString } from './neonClient';
import { Employee, ChatMessage, AbsenceRequest, StatutContrat, RoleType } from '@/data/mockData';

export const executeNeonQuery = async (queryFn: (sql: any) => Promise<any>) => {
  const connStr = getNeonConnectionString();
  if (!connStr || (!connStr.startsWith('postgres://') && !connStr.startsWith('postgresql://'))) {
    console.warn('Neon Connection String not set or invalid. Falling back to local state.');
    return null;
  }
  try {
    const sql = neon(connStr);
    return await queryFn(sql);
  } catch (err) {
    console.error('Neon SQL Query Error:', err);
    return null;
  }
};

// ==========================================
// 1. EMPLOYEES CRUD
// ==========================================
export const fetchNeonEmployees = async (): Promise<Employee[] | null> => {
  if (typeof window !== 'undefined') {
    try {
      const customUrl = localStorage.getItem('VOOMNET_NEON_DATABASE_URL') || '';
      const url = customUrl ? `/api/employees?customUrl=${encodeURIComponent(customUrl)}` : '/api/employees';
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && Array.isArray(data.employees) && data.employees.length > 0) {
          return data.employees;
        }
      }
    } catch (err) {
      console.warn('API fetch employees failed, attempting direct query:', err);
    }
  }

  return executeNeonQuery(async (sql) => {
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

    return rows.map((r: any) => {
      const s = String(r.status || '').toUpperCase();
      const mappedStatut = (s === 'CDI' || s === 'ACTIF' ? 'CDI' : s === 'STAGIAIRE' || s === 'STAGE' ? 'STAGIAIRE' : 'CDD') as StatutContrat;
      return {
        id: String(r.id || `emp-${Date.now()}`),
        matricule: String(r.matricule || '1000'),
        nom: String(r.last_name || ''),
        prenom: String(r.first_name || ''),
        email: String(r.email || ''),
        telephone3CX: String(r.phone || r.matricule || ''),
        role: (r.role === 'SUPERADMIN' ? 'SuperAdmin' : r.role === 'ADMIN' ? 'Admin' : 'Employé') as RoleType,
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
  });
};

export const insertNeonEmployee = async (emp: Employee) => {
  if (typeof window !== 'undefined') {
    try {
      const customUrl = localStorage.getItem('VOOMNET_NEON_DATABASE_URL') || '';
      await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...emp, customUrl }),
      });
    } catch (err) {
      console.warn('API insert employee failed:', err);
    }
  }

  return executeNeonQuery(async (sql) => {
    const roleDb = emp.role === 'SuperAdmin' ? 'SUPERADMIN' : (emp.role === 'Admin' || (emp.role as string) === 'Admin RH') ? 'ADMIN' : 'EMPLOYEE';
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
    return rows.map((r: any) => {
      const dbType = String(r.type || 'Permission d\'absence');
      const cleanType: AbsenceRequest['typeAbsence'] =
        dbType === 'Maladie' || dbType === 'SANTÉ'
          ? 'Maladie'
          : dbType === 'Congé annuel' || dbType === 'CONGÉ_PAYÉ'
          ? 'Congé annuel'
          : dbType === 'Événement familial'
          ? 'Événement familial'
          : 'Permission d\'absence';

      // Always resolve to a clean 3CX matricule (e.g., '1000', '1009', '1015', '1021', '9999')
      let resolvedMatricule = String(r.emp_matricule || r.employee_id || '1000');
      // If resolvedMatricule is a UUID or non-numeric long string, fallback to numeric string if present or target matching
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
  });
};

export const insertNeonLeaveRequest = async (req: any) => {
  return executeNeonQuery(async (sql) => {
    const typeDb = req.typeAbsence || req.type || 'Permission d\'absence';
    const statusDb = req.statut === 'Approuvé' ? 'APPROUVE' : req.statut === 'Refusé' ? 'REFUSE' : 'EN_ATTENTE';
    const targetMatricule = String(req.employeId || req.matricule || '1000');
    const targetName = String(req.employeNom || req.nomPrenom || 'Collaborateur');

    // 1. Resolve foreign key `employee_id` referencing `employees(id)`.
    // Auto-create employee record in Neon if missing so FK constraint never fails.
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

    // 2. Insert with FK resolution
    try {
      const reqId = req.id || `abs-${Date.now()}`;
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
      return rows[0];
    } catch (err) {
      // Fallback if table `leave_requests` uses DEFAULT gen_random_uuid() for primary key `id`
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
      return rows[0];
    }
  });
};

export const updateNeonLeaveRequestStatus = async (id: string, statut: string, notes?: string) => {
  return executeNeonQuery(async (sql) => {
    const statusDb = statut === 'Approuvé' ? 'APPROUVE' : statut === 'Refusé' ? 'REFUSE' : 'EN_ATTENTE';
    await sql`
      UPDATE leave_requests
      SET status = ${statusDb},
          approved_by = ${notes || 'Administration RH'}
      WHERE id = ${id};
    `;
  });
};
