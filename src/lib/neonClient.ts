import { neon } from '@neondatabase/serverless';

export const getNeonConnectionString = (): string => {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('VOOMNET_NEON_DATABASE_URL');
    if (custom) return custom;
  }
  return (
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.NEXT_PUBLIC_NEON_URL ||
    ''
  );
};

export const saveNeonConnectionString = (connectionString: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('VOOMNET_NEON_DATABASE_URL', connectionString.trim());
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
