import { neon } from '@neondatabase/serverless';

export const DEFAULT_NEON_URL = 'postgresql://neondb_owner:npg_ctQ3PBZwHfT1@ep-wandering-hall-aw7ln4ss-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require';

export const getNeonConnectionString = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('VOOMNET_NEON_DATABASE_URL');
    if (custom && custom.trim() !== '') return custom.trim();
  }
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.NEXT_PUBLIC_NEON_URL ||
    DEFAULT_NEON_URL
  ).trim();
};

export const saveNeonConnectionString = (connectionString: string) => {
  if (typeof window !== 'undefined') {
    const cleaned = connectionString.trim();
    localStorage.setItem('VOOMNET_NEON_DATABASE_URL', cleaned);
    localStorage.setItem('VOOMNET_DB_PROVIDER', 'NEON_POSTGRES');
  }
};

export const testNeonConnection = async (connectionString: string) => {
  try {
    const sql = neon(connectionString);
    const result = await sql`SELECT 1 as connected, NOW() as server_time;`;
    return {
      success: true,
      time: result[0]?.server_time,
      message: 'Connexion PostgreSQL réussie sur Neon.tech !',
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Impossible de se connecter à la base Neon.tech.',
    };
  }
};
