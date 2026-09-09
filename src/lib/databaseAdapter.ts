/**
 * VOOMNET TECHNOLOGY — ADAPTATEUR UNIVERSEL DE BASE DE DONNÉES
 * Support Multi-SGBD : Neon.tech, Supabase, Firebase, MongoDB, Prisma SQL, SQLite
 */

export type DatabaseProvider = 'NEON_POSTGRES' | 'SUPABASE' | 'FIREBASE' | 'MONGODB' | 'PRISMA_SQL' | 'SQLITE_LOCAL' | 'MOCK_LOCAL';

export interface DatabaseConfig {
  provider: DatabaseProvider;
  connectionString?: string;
  apiKey?: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'TESTING';
}

export const SUPPORTED_PROVIDERS = [
  {
    id: 'NEON_POSTGRES' as DatabaseProvider,
    name: 'Neon.tech (PostgreSQL Cloud)',
    description: 'PostgreSQL Serverless ultra-rapide avec connexion SSL directe.',
    type: 'PostgreSQL Cloud',
    recommended: true,
  },
  {
    id: 'SUPABASE' as DatabaseProvider,
    name: 'Supabase (PostgreSQL Cloud)',
    description: 'PostgreSQL managé avec API REST, Temps Réel et RLS.',
    type: 'SQL Cloud',
    recommended: false,
  },
  {
    id: 'PRISMA_SQL' as DatabaseProvider,
    name: 'Prisma ORM (OVH / AWS / Linux VPS)',
    description: 'Connexion directe à un serveur SQL traditionnel.',
    type: 'SQL Standard',
    recommended: false,
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
];

export const getActiveProvider = (): DatabaseProvider => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('VOOMNET_DB_PROVIDER') as DatabaseProvider;
    if (saved) return saved;
  }
  return 'NEON_POSTGRES';
};

export const setActiveProvider = (provider: DatabaseProvider) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('VOOMNET_DB_PROVIDER', provider);
  }
};
