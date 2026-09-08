-- =====================================================================
-- VOOMNET TECHNOLOGY — SCHÉMA BASE DE DONNÉES SUPABASE (PostgreSQL)
-- Application : Portail RH, Paie & Communication Internes
-- Date : 07 Septembre 2026
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLE DES EMPLOYÉS & PERSONNEL
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    matricule VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE' CHECK (role IN ('ADMIN', 'EMPLOYEE', 'SUPERADMIN')),
    position VARCHAR(150) NOT NULL,
    department VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIF' CHECK (status IN ('ACTIF', 'SUSPENDU', 'DESACTIVE')),
    base_salary NUMERIC(12, 2) NOT NULL DEFAULT 350000,
    hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLE DES BULLETINS DE PAIE & PRIMES
CREATE TABLE IF NOT EXISTS public.payrolls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    period_month VARCHAR(20) NOT NULL, -- Ex: "Septembre 2026"
    base_salary NUMERIC(12, 2) NOT NULL,
    performance_bonus NUMERIC(12, 2) DEFAULT 0,
    transport_allowance NUMERIC(12, 2) DEFAULT 30000,
    tax_deductions NUMERIC(12, 2) DEFAULT 0,
    net_salary NUMERIC(12, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'VALIDE' CHECK (payment_status IN ('EN_ATTENTE', 'VALIDE', 'PAYE')),
    payment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLE DES DEMANDES DE CONGÉS
CREATE TABLE IF NOT EXISTS public.leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    employee_name VARCHAR(200) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('CONGE_ANNUEL', 'MALADIE', 'PERMISSION', 'FORMATION')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INT NOT NULL DEFAULT 1,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'EN_ATTENTE' CHECK (status IN ('EN_ATTENTE', 'APPROUVE', 'REFUSE')),
    approved_by VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLE DU CHAT RH & MESSAGERIE DIRECTE
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
-- POLITIQUES DE SÉCURITÉ (Row Level Security - RLS)
-- ---------------------------------------------------------------------
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Autoriser l'accès en lecture/écriture publique (pour la démo frontend avec Anon Key)
CREATE POLICY "Accès universel employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès universel payrolls" ON public.payrolls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès universel leave_requests" ON public.leave_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Accès universel chat_messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);

-- ---------------------------------------------------------------------
-- DONNÉES DE DÉMONSTRATION INITIALES (SEED DATA VOOMNET)
-- ---------------------------------------------------------------------
INSERT INTO public.employees (matricule, first_name, last_name, email, phone, role, position, department, status, base_salary, hire_date, avatar_url)
VALUES
('9999', 'Alexandre', 'VOHOU', 'a.vohou@voomnet.com', '+225 07 00 11 22 33', 'SUPERADMIN', 'Directeur Général & Fondateur', 'Direction Générale', 'ACTIF', 1500000, '2020-01-15', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'),
('1000', 'Marc', 'KOUASSI', 'm.kouassi@voomnet.com', '+225 05 44 55 66 77', 'ADMIN', 'Responsable Ressources Humaines', 'Ressources Humaines', 'ACTIF', 750000, '2021-03-15', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'),
('1001', 'Koffi', 'N''GUESSAN', 'k.nguessan@voomnet.com', '+225 07 11 22 33 44', 'EMPLOYEE', 'Chef de Projet Télécom & VoIP', 'Support Technique & Telecom', 'ACTIF', 550000, '2022-05-10', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'),
('1009', 'Sarah', 'BAMBA', 's.bamba@voomnet.com', '+225 07 88 99 00 11', 'EMPLOYEE', 'Ingénieure Réseau & VoIP 3CX', 'Infrastructure & Réseaux 3CX', 'ACTIF', 600000, '2023-01-10', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80')
ON CONFLICT (matricule) DO NOTHING;

-- Seed Chat Initial
INSERT INTO public.chat_messages (sender_id, sender_name, recipient_id, recipient_name, text, delivered, delivery_status)
VALUES
('9999', 'Alexandre VOHOU', '1000', 'Marc KOUASSI', 'Bonjour Marc, merci de préparer le bilan de paie de septembre.', true, '✓✓ Envoyé & Distribué au Poste RH'),
('1000', 'Marc KOUASSI', '9999', 'Alexandre VOHOU', 'C est noté M. Le Directeur, les bulletins sont prêts pour validation.', true, '✓✓ Envoyé & Distribué au Poste DG');
