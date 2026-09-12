import { NextResponse } from 'next/server';
import { activatePhysicalTicket } from '@/lib/db';
import type { Attendee } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ticketCode, activatedBy, ...attendeeData } = body;
    
    if (!ticketCode || !attendeeData.name || !attendeeData.docId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const ticket = await activatePhysicalTicket(ticketCode, attendeeData as Attendee, activatedBy);
    
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found or already activated' }, { status: 400 });
    }
    
    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
