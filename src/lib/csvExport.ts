/**
 * VOOMNET TECH RH — Utilitaires d'export de données vers CSV
 *
 * Génère des fichiers CSV encodés en UTF-8 (avec BOM pour une ouverture
 * correcte dans Excel, y compris les caractères accentués français) et
 * déclenche leur téléchargement côté client.
 *
 * Fonctionne uniquement à partir des données déjà chargées en mémoire
 * (état React / AppContext), donc compatible avec tous les providers
 * de base de données (Neon, Supabase, mock, localStorage).
 */

/** Échappe une cellule CSV selon la RFC 4180. */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return '';

  let cell = String(value);

  // Si la cellule contient une virgule, un guillemet, un saut de ligne
  // ou un retour chariot, elle doit être entourée de guillemets.
  const needsQuotes = /[",\r\n]/.test(cell);
  if (needsQuotes) {
    cell = cell.replace(/"/g, '""');
    return `"${cell}"`;
  }
  return cell;
}

/** Convertit un tableau de lignes (objets) en texte CSV avec en-tête. */
export function toCsvText(
  columns: { key: string; label: string }[],
  rows: Record<string, unknown>[]
): string {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(',');
  const body = rows
    .map((row) =>
      columns.map((c) => escapeCsvCell(row[c.key])).join(',')
    )
    .join('\n');

  return `${header}\n${body}`;
}

/**
 * Déclenche le téléchargement d'un fichier texte (CSV) côté client.
 * Ajoute un BOM UTF-8 pour que Excel interprète correctement les accents.
 */
export function downloadCsv(csvText: string, filename: string): void {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvText], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.setAttribute('href', url);
  anchor.setAttribute('download', filename);
  anchor.style.visibility = 'hidden';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Génère un nom de fichier horodaté, ex: employes_voomnet_2026-09-10.csv */
export function exportFilename(prefix: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${prefix}_voomnet_${yyyy}-${mm}-${dd}.csv`;
}

/* ------------------------------------------------------------------ */
/* Schémas d'export par domaine métier                                */
/* ------------------------------------------------------------------ */

export const EMPLOYEE_COLUMNS: { key: keyof import('@/data/mockData').Employee; label: string }[] = [
  { key: 'matricule', label: 'Matricule 3CX' },
  { key: 'prenom', label: 'Prénom' },
  { key: 'nom', label: 'Nom' },
  { key: 'email', label: 'Email' },
  { key: 'telephone3CX', label: 'Téléphone 3CX' },
  { key: 'telephonePerso', label: 'Téléphone personnel' },
  { key: 'role', label: 'Rôle système' },
  { key: 'poste', label: 'Poste occupé' },
  { key: 'departement', label: 'Département' },
  { key: 'statut', label: 'Contrat' },
  { key: 'dateEmbauche', label: "Date d'embauche" },
  { key: 'salaireBase', label: 'Salaire de base (FCFA)' },
  { key: 'soldeConges', label: 'Solde congés (jours)' },
  { key: 'contactUrgence', label: 'Contact urgence' },
  { key: 'adresse', label: 'Adresse' },
  { key: 'notesAdministratives', label: 'Notes administratives RH' },
];

export const ABSENCE_COLUMNS: { key: keyof import('@/data/mockData').AbsenceRequest; label: string }[] = [
  { key: 'codeSuivi', label: 'Code suivi unique' },
  { key: 'matricule', label: 'Matricule 3CX' },
  { key: 'nomPrenom', label: 'Demandeur' },
  { key: 'typeAbsence', label: 'Type d\'absence' },
  { key: 'motif', label: 'Motif détaillé' },
  { key: 'dateDebut', label: 'Date de début' },
  { key: 'dateFin', label: 'Date de fin' },
  { key: 'dureeJours', label: 'Durée (jours ouvrés)' },
  { key: 'justifiee', label: 'Justifiée' },
  { key: 'statut', label: 'Statut RH' },
  { key: 'dateDemande', label: 'Date de demande' },
  { key: 'cadreAdminNotes', label: 'Remarque administrative RH' },
];

export const PRIME_COLUMNS: { key: string; label: string }[] = [
  { key: 'matricule', label: 'Matricule 3CX' },
  { key: 'nomPrenom', label: 'Employé' },
  { key: 'poste', label: 'Poste occupé' },
  { key: 'departement', label: 'Département' },
  { key: 'statutCollaborateur', label: 'Contrat' },
  { key: 'periodeNom', label: 'Période de prime' },
  { key: 'statut', label: 'Statut décision' },
  { key: 'montant', label: 'Montant alloué (FCFA)' },
  { key: 'motif', label: 'Motif / Remarque RH' },
];

export const AUDIT_LOG_COLUMNS: { key: keyof import('@/data/mockData').AuditLog; label: string }[] = [
  { key: 'timestamp', label: 'Horodatage' },
  { key: 'auteur', label: 'Auteur' },
  { key: 'type', label: 'Type d\'action' },
  { key: 'message', label: 'Détail de l\'action' },
];

/* ------------------------------------------------------------------ */
/* Fonctions d'export prêtes à l'emploi                               */
/* ------------------------------------------------------------------ */

/**
 * Exporte la liste des employés au format CSV.
 * @param employees tableau d'employés (type Employee de mockData)
 */
export function exportEmployees(employees: import('@/data/mockData').Employee[]): void {
  const csv = toCsvText(
    EMPLOYEE_COLUMNS,
    employees as unknown as Record<string, unknown>[]
  );
  downloadCsv(csv, exportFilename('employes'));
}

/**
 * Exporte la liste des demandes d'absence / congés au format CSV.
 * @param requests tableau d'AbsenceRequest
 */
export function exportAbsenceRequests(
  requests: import('@/data/mockData').AbsenceRequest[]
): void {
  const csv = toCsvText(
    ABSENCE_COLUMNS,
    requests as unknown as Record<string, unknown>[]
  );
  downloadCsv(csv, exportFilename('demandes_absence_conges'));
}

/**
 * Exporte le journal d'activité RH (audit logs) au format CSV.
 * @param logs tableau d'AuditLog
 */
export function exportAuditLogs(logs: import('@/data/mockData').AuditLog[]): void {
  const csv = toCsvText(
    AUDIT_LOG_COLUMNS,
    logs as unknown as Record<string, unknown>[]
  );
  downloadCsv(csv, exportFilename('journal_activite_rh'));
}

/**
 * Exporte les attributions de primes au format CSV.
 * Accepte des objets plats avec au moins les colonnes PRIME_COLUMNS.
 */
export function exportPrimes(primes: Record<string, unknown>[]): void {
  const csv = toCsvText(PRIME_COLUMNS, primes);
  downloadCsv(csv, exportFilename('primes_trimestrielles'));
}
