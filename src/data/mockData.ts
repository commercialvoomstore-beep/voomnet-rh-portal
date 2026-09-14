export type RoleType = 'SuperAdmin' | 'Admin' | 'Employé';

export const isSuperAdminRole = (role?: string) => {
  if (!role) return false;
  const r = role.toLowerCase();
  return r.includes('super');
};

export const isAdminRole = (role?: string) => {
  if (!role) return false;
  const r = role.toLowerCase();
  return r.includes('admin') && !r.includes('super');
};

export const isEmployeRole = (role?: string) => {
  if (!role) return true;
  return !isSuperAdminRole(role) && !isAdminRole(role);
};

export const normalizeRole = (role?: string): RoleType => {
  if (isSuperAdminRole(role)) return 'SuperAdmin';
  if (isAdminRole(role)) return 'Admin';
  return 'Employé';
};
export type StatutContrat = 'CDI' | 'CDD' | 'STAGIAIRE';

export interface Employee {
  id: string;
  matricule: string; // Poste 3CX (e.g., 9999, 1000)
  nom: string;
  prenom: string;
  email: string;
  telephone3CX: string;
  departement: string;
  poste: string;
  statut: StatutContrat;
  role: RoleType;
  dateEmbauche: string;
  soldeConges: number;
  avatar: string; // Base64 Data URI or Image URL
  motDePasse?: string; // Password created by admin or employee
  adresse?: string;
  telephonePerso?: string;
  contactUrgence?: string;
  notesAdministratives?: string;
  salaireBase?: number;
}

export interface AbsenceRequest {
  id: string;
  codeSuivi: string; // Format VN-P-2026-XXXXXX
  matricule: string;
  nomPrenom: string;
  fonctionService: string;
  dateEmbauche: string;
  typeAbsence: 'Permission d\'absence' | 'Congé annuel' | 'Maladie' | 'Événement familial';
  dateDebut: string;
  dateFin: string;
  dureeJours: number;
  motif: string;
  justifiee: boolean; // True = Justifiée (Prime Accordée), False = Non Justifiée (Prime Annulée)
  statut: 'En attente' | 'Approuvé' | 'Refusé';
  dateDemande: string;
  cadreAdminNotes?: string;
}

export interface PrimeConfig {
  periodeNom: string;
  dateDebut: string;
  dateFin: string;
  montantReference: number; // en FCFA
  penaliteAbsenceNonJustifiee: number;
  active: boolean;
}

export interface EmployeePrimeStatus {
  matricule: string;
  nomPrenom: string;
  dateEmbauche: string;
  statutCollaborateur: StatutContrat;
  roleCollaborateur: RoleType;
  periodeNom: string;
  eligible: boolean;
  montantCalcule: number;
  motifStatus?: string;
  dateAnnulation?: string;
  restaureeParAdmin?: boolean;
  restaureePar?: string;
  dateRestauration?: string;
  statut?: 'Accordée' | 'Refusée' | 'En attente';
  montant?: number;
  motif?: string;
  masquee?: boolean;
}

export interface ChatMessage {
  id: string;
  senderMatricule: string;
  senderName: string;
  senderRole: RoleType;
  senderAvatar: string;
  recipientMatricule: string;
  recipientName: string;
  text: string;
  timestamp: string;
  status: 'envoye' | 'distribue' | 'lu'; // Indicateur d'envoi émetteur -> récepteur
}

export interface AlertNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'CHAT';
  read: boolean;
  recipientMatricule?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  type: 'PRIME_CANCEL' | 'PRIME_RESTORE' | 'LEAVE_REQUEST' | 'EMPLOYEE_ADD' | 'EMPLOYEE_EDIT' | 'EMPLOYEE_DELETE' | 'ROLE_CHANGE' | 'AVATAR_CHANGE';
  message: string;
  auteur: string;
}

export const DEFAULT_FALLBACK_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

export const INITIAL_PRIME_CONFIG: PrimeConfig = {
  periodeNom: 'Trimestre 3 - 2026 (1er Juil - 30 Sept)',
  dateDebut: '2026-07-01',
  dateFin: '2026-09-30',
  montantReference: 150000,
  penaliteAbsenceNonJustifiee: 100,
  active: true,
};

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-0',
    matricule: '9999',
    nom: 'VOHOU',
    prenom: 'Alexandre',
    email: 'a.vohou@voomnet.com',
    telephone3CX: '9999',
    departement: 'Direction Générale',
    poste: 'Superadministrateur Système & DG',
    statut: 'CDI',
    role: 'SuperAdmin',
    dateEmbauche: '2020-01-15',
    soldeConges: 30,
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    motDePasse: 'voomnet2026',
    adresse: 'Cocody Ambassades, Abidjan',
    telephonePerso: '+225 07 00 11 22 33',
    contactUrgence: 'Epouse (+225 07 00 11 22 44)',
    notesAdministratives: 'Compte Administrateur Système initial.',
    salaireBase: 1500000,
  },
];

export const INITIAL_ABSENCE_REQUESTS: AbsenceRequest[] = [];

export const INITIAL_PRIMES: EmployeePrimeStatus[] = [
  {
    matricule: '9999',
    nomPrenom: 'Alexandre VOHOU',
    dateEmbauche: '2020-01-15',
    statutCollaborateur: 'CDI',
    roleCollaborateur: 'SuperAdmin',
    periodeNom: 'Trimestre 3 - 2026 (1er Juil - 30 Sept)',
    eligible: true,
    montantCalcule: 150000,
    motifStatus: 'Superadministrateur — Assiduité conforme',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];

export const INITIAL_NOTIFICATIONS: AlertNotification[] = [
  {
    id: 'notif-1',
    title: '🔔 Bienvenue sur VOOMNET TECH RH',
    message: 'Portail RH en production connecté à la base de données Neon PostgreSQL.',
    timestamp: 'À l instant',
    type: 'INFO',
    read: false,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-0',
    timestamp: '2026-09-14 00:00:00',
    type: 'ROLE_CHANGE',
    message: 'Initialisation du Portail RH Pro en mode Production.',
    auteur: 'SuperAdmin',
  },
];
