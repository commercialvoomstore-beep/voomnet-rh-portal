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
      return NextResponse.json({ success: false, error: 'Database connection URL not configured', messages: [] }, { status: 200 });
    }

    const rows = await sql`
      SELECT id, sender_id, sender_name, recipient_id, recipient_name, text, delivered, delivery_status, created_at
      FROM chat_messages
      ORDER BY created_at ASC;
    `;

    const messages = rows.map((r: any) => ({
      id: r.id,
      senderMatricule: r.sender_id,
      senderName: r.sender_name,
      recipientMatricule: r.recipient_id,
      recipientName: r.recipient_name,
      text: r.text,
      timestamp: new Date(r.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'distribue' as const,
    }));

    return NextResponse.json({ success: true, messages }, { status: 200 });
  } catch (err: any) {
    console.error('API GET /api/chat error:', err);
    return NextResponse.json({ success: false, error: err.message, messages: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customUrl, ...msg } = body;
    const sql = getDbConnection(customUrl);

    if (!sql) {
      return NextResponse.json({ success: false, error: 'Database connection URL not configured' }, { status: 200 });
    }

    await sql`
      INSERT INTO chat_messages (sender_id, sender_name, recipient_id, recipient_name, text, delivered, delivery_status)
      VALUES (
        ${msg.senderMatricule},
        ${msg.senderName},
        ${msg.recipientMatricule},
        ${msg.recipientName},
        ${msg.text},
        true,
        '✓✓ Envoyé & Distribué au Poste'
      );
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('API POST /api/chat error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
