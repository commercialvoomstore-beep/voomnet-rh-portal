import { neon } from '@neondatabase/serverless';

// Test connection function
async function testConnection(connStr) {
  console.log('Testing connection string:', connStr ? `${connStr.substring(0, 30)}...` : 'EMPTY');
  if (!connStr || !connStr.startsWith('postgres')) {
    console.error('❌ Connection string invalid or empty!');
    return;
  }
  try {
    const sql = neon(connStr);
    const timeRes = await sql`SELECT NOW() as server_time;`;
    console.log('✅ Connection SUCCESS! Server time:', timeRes[0]?.server_time);

    // Test tables existence
    const tablesRes = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public';
    `;
    console.log('📋 Existing tables in public schema:', tablesRes.map(t => t.table_name));

    // Test leave_requests table
    if (tablesRes.some(t => t.table_name === 'leave_requests')) {
      const lrRes = await sql`SELECT count(*) FROM leave_requests;`;
      console.log('📊 leave_requests count:', lrRes[0]?.count);
    }
  } catch (err) {
    console.error('❌ Neon SQL Connection Error:', err.message || err);
  }
}

const testConn = process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
testConnection(testConn);
