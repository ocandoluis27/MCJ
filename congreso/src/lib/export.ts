import * as XLSX from 'xlsx';
import { Order, Ticket } from '@/types';

export function exportAttendeesToExcel(tickets: Ticket[]) {
  const data = tickets.map(ticket => ({
    'Nombre y Apellido': ticket.attendeeName,
    'Cédula / Documento': ticket.attendeeDocId,
    'Teléfono': ticket.attendeePhone || 'N/A',
    'Email': ticket.attendeeEmail || 'N/A',
    'Ciudad': ticket.city || 'Maracaibo',
    'Parroquia': ticket.parish || 'N/A',
    'Grupo Apostolado': ticket.hasApostolate ? (ticket.apostolateName || 'Sí') : 'No',
    'Hospedaje': ticket.lodgingStatus === 'needs_lodging' ? 'Requiere hospedaje' : ticket.lodgingStatus === 'has_own' ? 'Hospedaje propio' : 'Residente local',
    'Sector Hospedaje/Residencia': ticket.lodgingLocation || 'N/A',
    'Transporte': ticket.transportStatus === 'needs_transport' ? 'Requiere apoyo / transporte' : 'Vehículo propio',
    'Tipo de Entrada': ticket.ticketType === 'physical' ? 'Física' : 'Digital',
    'Nro. Ticket': ticket.ticketNumber,
    'Código': ticket.ticketCode,
    'Comidas Restantes': ticket.mealsRemaining,
    'Acceso Escaneado': ticket.isUsed ? 'Sí' : 'No',
    'Comprador': ticket.buyerName
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Asistentes');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `Asistentes_Congreso_${new Date().toISOString().split('T')[0]}.xlsx`);
}

export function exportOrdersToExcel(orders: Order[]) {
  const data = orders.map(order => ({
    'Nro. Orden': order.id,
    'Fecha': new Date(order.createdAt).toLocaleString('es-VE'),
    'Comprador': order.buyerName,
    'Cédula / Documento': order.buyerDocId,
    'Teléfono': order.buyerPhone,
    'Email': order.buyerEmail,
    'Cant. Entradas': order.quantity,
    'Monto Pagado': order.amountPaid,
    'Moneda': order.currency,
    'Equivalente USD': order.convertedUsd,
    'Método de Pago': order.paymentMethod,
    'Referencia': order.paymentReference || 'N/A',
    'Estado': order.status,
    'Canal de Venta': order.salesChannel
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Órdenes');

  XLSX.writeFile(workbook, `Ordenes_Congreso_${new Date().toISOString().split('T')[0]}.xlsx`);
}
