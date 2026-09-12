import { Order, Ticket, EventConfig } from '@/types';
import { cleanPhoneForWhatsApp } from './utils';

const BOT_URL = process.env.BOT_URL || 'http://localhost:3001/send';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendWhatsAppConfirmation(order: Order, eventConfig: EventConfig) {
  if (!order.buyerPhone) return false;
  
  const formattedPhone = cleanPhoneForWhatsApp(order.buyerPhone);
  const ticketUrl = `${APP_URL}/ticket/${order.id}`;
  
  const message = `¡Hola ${order.buyerName}! 🙏
Tu inscripción para el *${eventConfig.eventName}* (${eventConfig.edition}) ha sido confirmada.

Fechas: ${eventConfig.dates}
Lugar: ${eventConfig.venue}

Detalles de tu orden:
🎫 Cantidad: ${order.quantity} entrada(s)
${eventConfig.includesMeals ? `🍽️ Incluye ${eventConfig.mealsPerTicket} comidas por entrada durante el congreso.` : ''}
${order.amountPaid > 0 ? `💰 Total pagado: $${order.convertedUsd.toFixed(2)}` : ''}

Puedes ver y descargar tus entradas digitales en el siguiente enlace:
👉 ${ticketUrl}

¡Te esperamos! Que Dios te bendiga.
María Camino a Jesús.`;

  try {
    const response = await fetch(BOT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: formattedPhone,
        message
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}
