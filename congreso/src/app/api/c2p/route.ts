import { NextResponse } from 'next/server';

// Prototype C2P Payment Process
export async function POST(request: Request) {
  try {
    const { bankCode, phone, cedula, amount, currency } = await request.json();
    
    // In a real integration, here you would call the bank's API to request an OTP
    // For this prototype, we simulate a successful OTP request
    
    if (!bankCode || !phone || !cedula || !amount) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const transactionId = `C2P-REQ-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    
    return NextResponse.json({
      success: true,
      transactionId,
      otpRequested: true,
      message: 'Clave dinámica enviada a su teléfono'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { transactionId, otp } = await request.json();
    
    if (!transactionId || !otp) {
      return NextResponse.json({ error: 'Missing transactionId or OTP' }, { status: 400 });
    }
    
    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For prototype, any 6-digit OTP is valid
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      return NextResponse.json({ error: 'OTP inválido, debe ser de 6 dígitos numéricos' }, { status: 400 });
    }
    
    const reference = `C2P-REF-${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
    
    return NextResponse.json({
      success: true,
      reference,
      message: 'Pago procesado exitosamente'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
