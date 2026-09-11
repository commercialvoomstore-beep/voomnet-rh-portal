export type RoleType = 'SuperAdmin' | 'Admin' | 'Employé';
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
    adresse: 'Cocody Ambassades, Abidjan',
    telephonePerso: '+225 07 00 11 22 33',
    contactUrgence: 'Epouse (+225 07 00 11 22 44)',
    notesAdministratives: 'Superadministrateur fondateur.',
    salaireBase: 1500000,
  },
  {
    id: 'emp-1',
    matricule: '1000',
    nom: 'KOUASSI',
    prenom: 'Marc',
    email: 'm.kouassi@voomnet.com',
    telephone3CX: '1000',
    departement: 'Ressources Humaines',
    poste: 'Administrateur RH',
    statut: 'CDI',
    role: 'Admin',
    dateEmbauche: '2021-03-15',
    soldeConges: 24,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    motDePasse: 'voomnet2026',
    adresse: 'Marcory Zone 4, Abidjan',
    telephonePerso: '+225 05 44 55 66 77',
    contactUrgence: 'Frère (+225 01 22 33 44 55)',
    notesAdministratives: 'Responsable de la validation des permissions.',
    salaireBase: 800000,
  },
  {
    id: 'emp-2',
    matricule: '1009',
    nom: 'BAMBA',
    prenom: 'Sarah',
    email: 's.bamba@voomnet.com',
    telephone3CX: '1009',
    departement: 'Infrastructure & Réseaux 3CX',
    poste: 'Ingénieure Réseau & VoIP',
    statut: 'CDI',
    role: 'Employé',
    dateEmbauche: '2023-01-10',
    soldeConges: 18,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    adresse: 'Riviera Palmeraie, Abidjan',
    telephonePerso: '+225 07 88 99 00 11',
    contactUrgence: 'Père (+225 05 11 22 33 44)',
    notesAdministratives: 'Excellents résultats sur l infrastructure VoIP 3CX.',
    salaireBase: 550000,
  },
  {
    id: 'emp-3',
    matricule: '1015',
    nom: 'DIABATÉ',
    prenom: 'Awa',
    email: 'a.diabate@voomnet.com',
    telephone3CX: '1015',
    departement: 'Développement Logiciel',
    poste: 'Développeuse Frontend React / Next.js',
    statut: 'CDD',
    role: 'Employé',
    dateEmbauche: '2026-07-15',
    soldeConges: 8,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    adresse: 'Angré 8ème Tranche, Abidjan',
    telephonePerso: '+225 01 99 88 77 66',
    contactUrgence: 'Mère (+225 07 33 22 11 00)',
    notesAdministratives: 'Absence maladie justifiée avec certificat : prime maintenue.',
    salaireBase: 400000,
  },
  {
    id: 'emp-4',
    matricule: '1021',
    nom: 'TRAORÉ',
    prenom: 'Yves',
    email: 'y.traore@voomnet.com',
    telephone3CX: '1021',
    departement: 'Développement Logiciel',
    poste: 'Stagiaire Développeur Fullstack',
    statut: 'STAGIAIRE',
    role: 'Employé',
    dateEmbauche: '2026-06-01',
    soldeConges: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    adresse: 'Yopougon Niangon, Abidjan',
    telephonePerso: '+225 05 66 77 88 99',
    contactUrgence: 'Oncle (+225 01 44 55 66 77)',
    notesAdministratives: 'Absence non justifiée le 02/09/2026 -> Prime T3 annulée.',
    salaireBase: 150000,
  },
];

export const INITIAL_ABSENCE_REQUESTS: AbsenceRequest[] = [
  {
    id: 'abs-1',
    codeSuivi: 'VN-P-2026-081942',
    matricule: '1021',
    nomPrenom: 'Yves TRAORÉ',
    fonctionService: 'Développement Logiciel (STAGIAIRE)',
    dateEmbauche: '2026-06-01',
    typeAbsence: 'Permission d\'absence',
    dateDebut: '2026-09-02',
    dateFin: '2026-09-03',
    dureeJours: 2,
    motif: 'Démarches personnelles sans justificatif',
    justifiee: false,
    statut: 'Refusé',
    dateDemande: '2026-09-01',
    cadreAdminNotes: 'Absence non justifiée pendant le trimestre -> Prime T3 2026 annulée.',
  },
  {
    id: 'abs-2',
    codeSuivi: 'VN-P-2026-090211',
    matricule: '1009',
    nomPrenom: 'Sarah BAMBA',
    fonctionService: 'Infrastructure & Réseaux 3CX (CDI)',
    dateEmbauche: '2023-01-10',
    typeAbsence: 'Congé annuel',
    dateDebut: '2026-09-15',
    dateFin: '2026-09-22',
    dureeJours: 6,
    motif: 'Congés payés annuels accordés',
    justifiee: true,
    statut: 'Approuvé',
    dateDemande: '2026-09-04',
    cadreAdminNotes: 'Congé légal approuvé par l Administrateur RH. Prime maintenue.',
  },
  {
    id: 'abs-3',
    codeSuivi: 'VN-P-2026-090550',
    matricule: '1015',
    nomPrenom: 'Awa DIABATÉ',
    fonctionService: 'Développement Logiciel (CDD)',
    dateEmbauche: '2026-07-15',
    typeAbsence: 'Maladie',
    dateDebut: '2026-09-08',
    dateFin: '2026-09-09',
    dureeJours: 2,
    motif: 'Repos médical avec arrêt de travail officiel fourni',
    justifiee: true,
    statut: 'Approuvé',
    dateDemande: '2026-09-07',
    cadreAdminNotes: 'Certificat médical officiel validé par Admin RH. Prime T3 maintenue.',
  },
];

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
  {
    matricule: '1000',
    nomPrenom: 'Marc KOUASSI',
    dateEmbauche: '2021-03-15',
    statutCollaborateur: 'CDI',
    roleCollaborateur: 'Admin',
    periodeNom: 'Trimestre 3 - 2026 (1er Juil - 30 Sept)',
    eligible: true,
    montantCalcule: 150000,
    motifStatus: 'Administrateur RH — Assiduité conforme',
  },
  {
    matricule: '1009',
    nomPrenom: 'Sarah BAMBA',
    dateEmbauche: '2023-01-10',
    statutCollaborateur: 'CDI',
    roleCollaborateur: 'Employé',
    periodeNom: 'Trimestre 3 - 2026 (1er Juil - 30 Sept)',
    eligible: true,
    montantCalcule: 150000,
    motifStatus: 'Absence congé payé justifiée — Prime Accordée',
  },
  {
    matricule: '1015',
    nomPrenom: 'Awa DIABATÉ',
    dateEmbauche: '2026-07-15',
    statutCollaborateur: 'CDD',
    roleCollaborateur: 'Employé',
    periodeNom: 'Trimestre 3 - 2026 (1er Juil - 30 Sept)',
    eligible: true,
    montantCalcule: 150000,
    motifStatus: 'Absence maladie avec justificatif fourni — Prime Accordée',
  },
  {
    matricule: '1021',
    nomPrenom: 'Yves TRAORÉ',
    dateEmbauche: '2026-06-01',
    statutCollaborateur: 'STAGIAIRE',
    roleCollaborateur: 'Employé',
    periodeNom: 'Trimestre 3 - 2026 (1er Juil - 30 Sept)',
    eligible: false,
    montantCalcule: 0,
    motifStatus: 'Absence non justifiée le 02/09/2026 — Prime Annulée',
    dateAnnulation: '2026-09-02 08:30:00',
  },
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'chat-1',
    senderMatricule: '9999',
    senderName: 'Alexandre VOHOU',
    senderRole: 'SuperAdmin',
    senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    recipientMatricule: '1000',
    recipientName: 'Marc KOUASSI',
    text: 'Bonjour Marc. La grille des primes T3 2026 est configurée. Merci de vous assurer du suivi des justificatifs d absence.',
    timestamp: '09:15',
    status: 'lu',
  },
  {
    id: 'chat-2',
    senderMatricule: '1000',
    senderName: 'Marc KOUASSI',
    senderRole: 'Admin',
    senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    recipientMatricule: '9999',
    recipientName: 'Alexandre VOHOU',
    text: 'Bien reçu M. le Superadministrateur. Les dossiers sont à jour.',
    timestamp: '09:22',
    status: 'lu',
  },
];

export const INITIAL_NOTIFICATIONS: AlertNotification[] = [
  {
    id: 'notif-1',
    title: '🔔 Bienvenue sur VOOMNET TECH RH',
    message: 'Portail RH fonctionnel avec indicateur d envoi des messages émetteur vers récepteur.',
    timestamp: 'À l instant',
    type: 'INFO',
    read: false,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-0',
    timestamp: '2026-09-07 09:00:00',
    type: 'ROLE_CHANGE',
    message: 'Mise à jour du système de messagerie : indicateur de transmission directe émetteur vers récepteur.',
    auteur: 'SuperAdmin (Alexandre VOHOU)',
  },
];
