/**
 * VOOMNET TECHNOLOGY — ADAPTATEUR UNIVERSEL DE BASE DE DONNÉES
 * Support Multi-SGBD : Supabase, Firebase, MongoDB, Prisma SQL, SQLite
 */

export type DatabaseProvider = 'SUPABASE' | 'FIREBASE' | 'MONGODB' | 'PRISMA_SQL' | 'SQLITE_LOCAL' | 'MOCK_LOCAL';

export interface DatabaseConfig {
  provider: DatabaseProvider;
  connectionString?: string;
  apiKey?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'TESTING';
}

export const SUPPORTED_PROVIDERS = [
  {
    id: 'SUPABASE' as DatabaseProvider,
    name: 'Supabase (PostgreSQL Cloud)',
    description: 'PostgreSQL managé avec API REST, Temps Réel et RLS.',
    type: 'SQL Cloud',
    recommended: true,
  },
  {
    id: 'PRISMA_SQL' as DatabaseProvider,
    name: 'Prisma ORM (PostgreSQL / MySQL / MariaDB)',
    description: 'Connexion directe à un serveur SQL traditionnel (OVH, LWS, AWS RDS).',
    type: 'SQL Standard',
    recommended: true,
  },
  {
    id: 'FIREBASE' as DatabaseProvider,
    name: 'Google Firebase / Firestore',
    description: 'Base NoSQL en temps réel avec authentification Google.',
    type: 'NoSQL Cloud',
    recommended: false,
  },
  {
    id: 'MONGODB' as DatabaseProvider,
    name: 'MongoDB Atlas',
    description: 'Base de données NoSQL orientée documents JSON.',
    type: 'NoSQL Document',
    recommended: false,
  },
  {
    id: 'SQLITE_LOCAL' as DatabaseProvider,
    name: 'SQLite / Turso LibSQL',
    description: 'Fichier local .sqlite3 sans dépendance de serveur externe.',
    type: 'Fichier Local / Edge',
    recommended: false,
  },
];

export const getActiveProvider = (): DatabaseProvider => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('VOOMNET_DB_PROVIDER') as DatabaseProvider;
    if (saved) return saved;
  }
  return 'MOCK_LOCAL';
};

export const setActiveProvider = (provider: DatabaseProvider) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('VOOMNET_DB_PROVIDER', provider);
  }
};
