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
      return NextResponse.json({ success: false, attributions: [] }, { status: 200 });
    }

    await sql`
      CREATE TABLE IF NOT EXISTS prime_attributions (
        id VARCHAR(36) PRIMARY KEY,
        matricule VARCHAR(20) NOT NULL,
        nom_prenom VARCHAR(200) NOT NULL,
        periode_nom VARCHAR(100) NOT NULL,
        statut VARCHAR(20) NOT NULL DEFAULT 'En attente',
        montant NUMERIC(12, 2) NOT NULL DEFAULT 0,
        motif TEXT,
        approved_by VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unq_prime_emp_periode UNIQUE (matricule, periode_nom)
      );
    `;

    const rows = await sql`
      SELECT id, matricule, nom_prenom, periode_nom, statut, montant, motif, approved_by, created_at
      FROM prime_attributions
      ORDER BY created_at DESC;
    `;

    const attributions = rows.map((r: any) => ({
      id: String(r.id),
      matricule: String(r.matricule),
      nomPrenom: String(r.nom_prenom || ''),
      periodeNom: String(r.periode_nom || 'Trimestre 3 - 2026'),
      statut: String(r.statut || 'En attente') as 'Accordée' | 'Refusée' | 'En attente',
      montant: Number(r.montant) || 0,
      motif: String(r.motif || ''),
      approvedBy: String(r.approved_by || 'Administration RH'),
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({ success: true, attributions }, { status: 200 });
  } catch (err: any) {
    console.error('API GET /api/primes error:', err);
    return NextResponse.json({ success: false, error: err.message, attributions: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, matricule, nomPrenom, periodeNom, statut, montant, motif, approvedBy, customUrl } = body;
    const sql = getDbConnection(customUrl);

    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database connection URL not configured' }, { status: 200 });
    }

    await sql`
      CREATE TABLE IF NOT EXISTS prime_attributions (
        id VARCHAR(36) PRIMARY KEY,
        matricule VARCHAR(20) NOT NULL,
        nom_prenom VARCHAR(200) NOT NULL,
        periode_nom VARCHAR(100) NOT NULL,
        statut VARCHAR(20) NOT NULL DEFAULT 'En attente',
        montant NUMERIC(12, 2) NOT NULL DEFAULT 0,
        motif TEXT,
        approved_by VARCHAR(150),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unq_prime_emp_periode UNIQUE (matricule, periode_nom)
      );
    `;

    const itemId = id || `prime-${matricule}-${Date.now()}`;

    await sql`
      INSERT INTO prime_attributions (id, matricule, nom_prenom, periode_nom, statut, montant, motif, approved_by, created_at)
      VALUES (
        ${itemId},
        ${matricule},
        ${nomPrenom || 'Employé'},
        ${periodeNom || 'Trimestre 3 - 2026'},
        ${statut || 'En attente'},
        ${montant || 0},
        ${motif || ''},
        ${approvedBy || 'Administration RH'},
        NOW()
      )
      ON CONFLICT (matricule, periode_nom) DO UPDATE SET
        statut = EXCLUDED.statut,
        montant = EXCLUDED.montant,
        motif = EXCLUDED.motif,
        approved_by = EXCLUDED.approved_by,
        created_at = NOW();
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('API POST /api/primes error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
