import { NextResponse } from 'next/server';

const BOT_URL = process.env.BOT_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const res = await fetch(`${BOT_URL}/status`);
    if (!res.ok) throw new Error('Bot not responding');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ status: 'offline', error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${BOT_URL}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    
    if (!res.ok) throw new Error('Failed to send message');
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
