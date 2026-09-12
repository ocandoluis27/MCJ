import { NextResponse } from 'next/server';
import { getEventConfig, updateEventConfig } from '@/lib/db';

export async function GET() {
  try {
    const config = await getEventConfig();
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const updates = await request.json();
    const config = await updateEventConfig(updates);
    return NextResponse.json(config);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
