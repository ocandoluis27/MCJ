import { NextResponse } from 'next/server';
import { getPhysicalTickets, generatePhysicalTickets } from '@/lib/db';

export async function GET() {
  try {
    const tickets = await getPhysicalTickets();
    return NextResponse.json(tickets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const tickets = await generatePhysicalTickets();
    return NextResponse.json(tickets, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
