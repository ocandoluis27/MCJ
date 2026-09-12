import { NextResponse } from 'next/server';
import { getAllOrders, createOrder, getEventConfig } from '@/lib/db';
import { sendWhatsAppConfirmation } from '@/lib/whatsapp';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    let orders = await getAllOrders();
    
    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const order = await createOrder(data);
    
    if (order.status === 'approved') {
      const config = await getEventConfig();
      await sendWhatsAppConfirmation(order, config);
    }
    
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
