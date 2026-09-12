import { NextResponse } from 'next/server';
import { getTicketByCode } from '@/lib/db';

export async function GET(request: Request, { params }: { params: { code: string } }) {
  try {
    const result = await getTicketByCode(params.code);
    if (!result) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
