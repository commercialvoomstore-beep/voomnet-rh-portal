import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

function getDbConnection(customUrl?: string) {
  const connStr =
    customUrl ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.NEXT_PUBLIC_NEON_URL ||
    '';
  if (!connStr || (!connStr.startsWith('postgres://') && !connStr.startsWith('postgresql://'))) {
    return null;
  }
  try {
    return neon(connStr);
  } catch (err) {
    console.error('Neon server connection error:', err);
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customUrl = searchParams.get('customUrl') || undefined;
    const sql = getDbConnection(customUrl);

    if (!sql) {
      return NextResponse.json(
        {
          success: false,
          config: {
            periodeNom: 'Trimestre 3 - 2026 (1er Juil - 30 Sept)',
            dateDebut: '2026-07-01',
            dateFin: '2026-09-30',
            montantReference: 150000,
            penaliteAbsenceNonJustifiee: 100,
            active: true,
          },
        },
        { status: 200 }
      );
    }

    // Auto-create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS system_config (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const rows = await sql`
      SELECT key, value FROM system_config WHERE key IN ('prime_montant_reference', 'prime_periode_nom');
    `;

    let montantReference = 150000;
    let periodeNom = 'Trimestre 3 - 2026 (1er Juil - 30 Sept)';

    rows.forEach((r: any) => {
      if (r.key === 'prime_montant_reference' && r.value) {
        const val = Number(r.value);
        if (!isNaN(val) && val > 0) montantReference = val;
      }
      if (r.key === 'prime_periode_nom' && r.value) {
        periodeNom = r.value;
      }
    });

    return NextResponse.json(
      {
        success: true,
        config: {
          periodeNom,
          dateDebut: '2026-07-01',
          dateFin: '2026-09-30',
          montantReference,
          penaliteAbsenceNonJustifiee: 100,
          active: true,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('API GET /api/prime-config error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        config: {
          periodeNom: 'Trimestre 3 - 2026 (1er Juil - 30 Sept)',
          dateDebut: '2026-07-01',
          dateFin: '2026-09-30',
          montantReference: 150000,
          penaliteAbsenceNonJustifiee: 100,
          active: true,
        },
      },
      { status: 200 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { montantReference, periodeNom, customUrl } = body;
    const sql = getDbConnection(customUrl);

    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database connection URL not configured' }, { status: 200 });
    }

    await sql`
      CREATE TABLE IF NOT EXISTS system_config (
        key VARCHAR(100) PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    if (montantReference !== undefined) {
      await sql`
        INSERT INTO system_config (key, value, updated_at)
        VALUES ('prime_montant_reference', ${String(montantReference)}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `;
    }

    if (periodeNom) {
      await sql`
        INSERT INTO system_config (key, value, updated_at)
        VALUES ('prime_periode_nom', ${String(periodeNom)}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
      `;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('API POST /api/prime-config error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
