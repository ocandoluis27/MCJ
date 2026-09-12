import { NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus, getEventConfig } from '@/lib/db';
import { sendWhatsAppConfirmation } from '@/lib/whatsapp';
import type { OrderStatus } from '@/types';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status, verifiedBy, rejectionReason } = await request.json() as { status: OrderStatus; verifiedBy?: string; rejectionReason?: string };
    const order = await updateOrderStatus(id, status, verifiedBy, rejectionReason);
    
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    
    if (status === 'approved') {
      const config = await getEventConfig();
      await sendWhatsAppConfirmation(order, config);
    }
    
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
