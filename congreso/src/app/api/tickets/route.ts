import { NextResponse } from 'next/server';
import { getAllTickets } from '@/lib/db';

export async function GET() {
  try {
    const tickets = await getAllTickets();
    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
