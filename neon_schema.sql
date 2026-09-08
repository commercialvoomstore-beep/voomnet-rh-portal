-- =====================================================================
-- VOOMNET TECHNOLOGY — SCHÉMA POSTGRESQL POUR NEON.TECH
-- Application : Portail RH, Paie & Communication Internes
-- Date : 08 Septembre 2026
-- =====================================================================

-- 1. TABLE DES EMPLOYÉS & PERSONNEL
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE DES BULLETINS DE PAIE
CREATE TABLE IF NOT EXISTS payrolls (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    employee_id VARCHAR(36) REFERENCES employees(id) ON DELETE CASCADE,
    period_month VARCHAR(20) NOT NULL,
    base_salary NUMERIC(12, 2) NOT NULL,
    performance_bonus NUMERIC(12, 2) DEFAULT 0,
    transport_allowance NUMERIC(12, 2) DEFAULT 30000,
    tax_deductions NUMERIC(12, 2) DEFAULT 0,
    net_salary NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'VALIDE',
    payment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLE DES DEMANDES DE CONGÉS
CREATE TABLE IF NOT EXISTS leave_requests (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    employee_id VARCHAR(36) REFERENCES employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT NOT NULL DEFAULT 1,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'EN_ATTENTE',
    approved_by VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLE DU CHAT RH
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sender_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(150) NOT NULL,
    recipient_id VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(150) NOT NULL,
    text TEXT NOT NULL,
    delivered BOOLEAN DEFAULT TRUE,
    delivery_status VARCHAR(100) DEFAULT '✓✓ Envoyé & Distribué au Poste',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- DONNÉES D'INITIALISATION VOOMNET (SEED DATA)
-- ---------------------------------------------------------------------
INSERT INTO employees (matricule, first_name, last_name, email, phone, role, position, department, status, base_salary, hire_date, avatar_url)
VALUES
('9999', 'Alexandre', 'VOHOU', 'a.vohou@voomnet.com', '+225 07 00 11 22 33', 'SUPERADMIN', 'Directeur Général & Fondateur', 'Direction Générale', 'ACTIF', 1500000, '2020-01-15', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'),
('1000', 'Marc', 'KOUASSI', 'm.kouassi@voomnet.com', '+225 05 44 55 66 77', 'ADMIN', 'Responsable Ressources Humaines', 'Ressources Humaines', 'ACTIF', 750000, '2021-03-15', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
('1001', 'Koffi', 'N''GUESSAN', 'k.nguessan@voomnet.com', '+225 07 11 22 33 44', 'EMPLOYEE', 'Chef de Projet Télécom & VoIP', 'Support Technique & Telecom', 'ACTIF', 550000, '2022-05-10', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
('1009', 'Sarah', 'BAMBA', 's.bamba@voomnet.com', '+225 07 88 99 00 11', 'EMPLOYEE', 'Ingénieure Réseau & VoIP 3CX', 'Infrastructure & Réseaux 3CX', 'ACTIF', 600000, '2023-01-10', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (matricule) DO NOTHING;

INSERT INTO chat_messages (sender_id, sender_name, recipient_id, recipient_name, text, delivered, delivery_status)
VALUES
('9999', 'Alexandre VOHOU', '1000', 'Marc KOUASSI', 'Bonjour Marc, la base Neon.tech est connectée avec succès.', true, '✓✓ Envoyé & Distribué au Poste RH');
