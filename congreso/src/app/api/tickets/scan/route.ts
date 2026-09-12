import { NextResponse } from 'next/server';
import { scanTicket } from '@/lib/db';
import type { ScanMode } from '@/types';

export async function POST(request: Request) {
  try {
    const { ticketCode, scannedBy, mode } = await request.json() as { ticketCode: string; scannedBy: string; mode: ScanMode };
    
    if (!ticketCode || !scannedBy || !mode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const result = await scanTicket(ticketCode, scannedBy, mode);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
