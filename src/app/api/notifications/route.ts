import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_NEON_URL = 'postgresql://neondb_owner:npg_ctQ3PBZwHfT1@ep-wandering-hall-aw7ln4ss-pooler.c-12.us-east-1.aws.neon.tech/neondb?sslmode=require';

function getDbConnection(customUrl?: string) {
  const connStr =
    customUrl ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.NEXT_PUBLIC_NEON_URL ||
    DEFAULT_NEON_URL;
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

async function ensureNotificationTable(sql: any) {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS system_notifications (
        id VARCHAR(60) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'INFO',
        recipient_matricule VARCHAR(20),
        target_role VARCHAR(20),
        read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`ALTER TABLE system_notifications ADD COLUMN IF NOT EXISTS target_role VARCHAR(20);`;
  } catch (e) {
    // Ignore schema exists warning
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customUrl = searchParams.get('customUrl') || undefined;
    const matricule = searchParams.get('matricule') || undefined;
    const role = searchParams.get('role') || undefined;

    const sql = getDbConnection(customUrl);
    if (!sql) {
      return NextResponse.json({ success: false, notifications: [] }, { status: 200 });
    }

    await ensureNotificationTable(sql);

    let rows: any[] = [];
    if (matricule) {
      const cleanM = String(matricule).trim();
      const cleanR = role ? String(role).trim().toUpperCase() : 'EMPLOYEE';
      rows = await sql`
        SELECT id, title, message, type, recipient_matricule, target_role, read, created_at
        FROM system_notifications
        WHERE recipient_matricule = ${cleanM}
           OR (recipient_matricule IS NULL AND (target_role IS NULL OR target_role = ${cleanR} OR target_role = 'ALL'))
        ORDER BY created_at DESC
        LIMIT 50;
      `;
    } else {
      rows = await sql`
        SELECT id, title, message, type, recipient_matricule, target_role, read, created_at
        FROM system_notifications
        ORDER BY created_at DESC
        LIMIT 50;
      `;
    }

    const notifications = rows.map((r: any) => ({
      id: String(r.id),
      title: String(r.title || ''),
      message: String(r.message || ''),
      timestamp: r.created_at ? new Date(r.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      type: String(r.type || 'INFO') as 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'CHAT',
      read: Boolean(r.read),
      recipientMatricule: r.recipient_matricule ? String(r.recipient_matricule) : undefined,
      targetRole: r.target_role ? String(r.target_role) : undefined,
    }));

    return NextResponse.json({ success: true, notifications }, { status: 200 });
  } catch (err: any) {
    console.error('API GET /api/notifications error:', err);
    return NextResponse.json({ success: false, error: err.message, notifications: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, message, type, recipientMatricule, targetRole, customUrl } = body;
    const sql = getDbConnection(customUrl);

    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 200 });
    }

    await ensureNotificationTable(sql);

    const notifId = id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const cleanRecipient = recipientMatricule ? String(recipientMatricule).trim() : null;
    const cleanRole = targetRole ? String(targetRole).trim().toUpperCase() : null;

    await sql`
      INSERT INTO system_notifications (id, title, message, type, recipient_matricule, target_role, read, created_at)
      VALUES (
        ${notifId},
        ${title || 'Notification RH'},
        ${message || ''},
        ${type || 'INFO'},
        ${cleanRecipient},
        ${cleanRole},
        false,
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        message = EXCLUDED.message,
        type = EXCLUDED.type,
        recipient_matricule = EXCLUDED.recipient_matricule,
        target_role = EXCLUDED.target_role;
    `;

    return NextResponse.json({ success: true, id: notifId }, { status: 200 });
  } catch (err: any) {
    console.error('API POST /api/notifications error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, matricule, customUrl } = body;
    const sql = getDbConnection(customUrl);

    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 200 });
    }

    await ensureNotificationTable(sql);

    if (id) {
      await sql`
        UPDATE system_notifications
        SET read = true
        WHERE id = ${id};
      `;
    } else if (matricule) {
      const cleanM = String(matricule).trim();
      await sql`
        UPDATE system_notifications
        SET read = true
        WHERE recipient_matricule = ${cleanM};
      `;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('API PUT /api/notifications error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const matricule = searchParams.get('matricule');
    const customUrl = searchParams.get('customUrl') || undefined;

    const sql = getDbConnection(customUrl);
    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 200 });
    }

    await ensureNotificationTable(sql);

    if (matricule) {
      const cleanM = String(matricule).trim();
      await sql`
        DELETE FROM system_notifications
        WHERE recipient_matricule = ${cleanM};
      `;
    } else {
      await sql`DELETE FROM system_notifications;`;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('API DELETE /api/notifications error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
