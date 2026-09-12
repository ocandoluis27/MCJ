import { NextResponse } from 'next/server';
import { getEventStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = await getEventStats();
    return NextResponse.json(stats);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
