import fs from 'fs';
import path from 'path';
import { supabase } from './supabase';
import { generateTicketCode, generateOrderId } from './utils';
import { generateQrCode } from './qr';
import type { EventConfig, Order, Ticket, PhysicalTicket, ScanResult, EventStats, Attendee, OrderStatus } from '@/types';

// JSON file fallback / local cache
const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'congreso_db.json');

export const DEFAULT_CONFIG: EventConfig = {
  eventName: 'Congreso Gracia y Misericordia',
  subtitle: '«Llamó a los que quiso para que estuvieran con Él» — Marcos 3, 13',
  edition: 'Asociación Pública de Fieles María Camino a Jesús',
  dates: '16 al 18 de Octubre de 2026',
  time: 'Viernes 16 al Domingo 18 de Octubre de 2026',
  venue: 'Centro de Arte de Maracaibo Lía Bermúdez',
  venueAddress: 'Casco Central, Plaza Baralt, Maracaibo, Estado Zulia',
  totalQuota: 1200,
  physicalTickets: 250,
  ticketPriceUsd: 0,
  currentRateBsEuro: 49.2,
  currentRateBsDollar: 45.5,
  description: 'Tres días de gracia, misericordia y formación espiritual con invitados especiales: Pbro. Ignacio Amorós, Pbro. Renzo Gotera, Pbro. Inocencio Llamas, Sor. Caterina Esselen y Sor. Filipa.',
  includesMeals: true,
  mealsPerTicket: 3,
  congressDays: 3,
  paymentDetails: {
    c2p: {
      enabled: true,
      bankCode: '0134',
      phone: '04140000000',
      docId: 'J-123456789',
      holder: 'Asociación María Camino a Jesús'
    },
    pagoMovil: {
      bank: 'Banesco (0134)',
      phone: '04140000000',
      docId: 'J-123456789',
      holder: 'Asociación María Camino a Jesús'
    },
    cash: {
      location: 'Sede Principal y Taquilla CAMLB',
      schedule: 'Lunes a Viernes 8:00 AM - 4:00 PM'
    }
  }
};

interface DbSchema {
  config: EventConfig;
  orders: Order[];
  physicalTickets: PhysicalTicket[];
}

function isSupabaseAvailable(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && url !== 'https://placeholder.supabase.co';
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDb(): DbSchema {
  try {
    ensureDataDir();
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data) as DbSchema;
    }
  } catch (error) {
    console.error('Error reading db fallback:', error);
  }
  return {
    config: { ...DEFAULT_CONFIG },
    orders: [],
    physicalTickets: []
  };
}

function writeDb(data: DbSchema) {
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing db fallback:', error);
  }
}

// Data Mappers
function mapRowToOrder(row: any): Order {
  return {
    id: row.id,
    createdAt: row.created_at,
    buyerName: row.buyer_name,
    buyerEmail: row.buyer_email || '',
    buyerPhone: row.buyer_phone,
    buyerDocId: row.buyer_doc_id,
    quantity: Number(row.quantity),
    attendees: typeof row.attendees === 'string' ? JSON.parse(row.attendees) : (row.attendees || []),
    paymentMethod: row.payment_method,
    paymentReference: row.payment_reference || '',
    paymentProofUrl: row.payment_proof_url || undefined,
    amountPaid: Number(row.amount_paid),
    currency: row.currency,
    convertedUsd: Number(row.converted_usd),
    rateApplied: row.rate_applied ? Number(row.rate_applied) : undefined,
    status: row.status,
    salesChannel: row.sales_channel,
    sellerName: row.seller_name || undefined,
    rejectionReason: row.rejection_reason || undefined,
    verifiedAt: row.verified_at || undefined,
    verifiedBy: row.verified_by || undefined,
    notes: row.notes || undefined,
    tickets: typeof row.tickets === 'string' ? JSON.parse(row.tickets) : (row.tickets || [])
  };
}

function mapOrderToRow(order: Order) {
  return {
    id: order.id,
    created_at: order.createdAt,
    buyer_name: order.buyerName,
    buyer_email: order.buyerEmail || null,
    buyer_phone: order.buyerPhone,
    buyer_doc_id: order.buyerDocId,
    quantity: order.quantity,
    attendees: order.attendees,
    payment_method: order.paymentMethod,
    payment_reference: order.paymentReference || null,
    payment_proof_url: order.paymentProofUrl || null,
    amount_paid: order.amountPaid,
    currency: order.currency,
    converted_usd: order.convertedUsd,
    rate_applied: order.rateApplied || null,
    status: order.status,
    sales_channel: order.salesChannel,
    seller_name: order.sellerName || null,
    rejection_reason: order.rejectionReason || null,
    verified_at: order.verifiedAt || null,
    verified_by: order.verifiedBy || null,
    notes: order.notes || null,
    tickets: order.tickets
  };
}

function mapTicketToRow(ticket: Ticket) {
  return {
    id: ticket.id,
    order_id: ticket.orderId,
    ticket_code: ticket.ticketCode,
    ticket_number: ticket.ticketNumber,
    ticket_type: ticket.ticketType,
    attendee_name: ticket.attendeeName,
    attendee_doc_id: ticket.attendeeDocId,
    attendee_phone: ticket.attendeePhone || null,
    attendee_email: ticket.attendeeEmail || null,
    buyer_name: ticket.buyerName,
    buyer_phone: ticket.buyerPhone,
    city: ticket.city || null,
    parish: ticket.parish || null,
    has_apostolate: Boolean(ticket.hasApostolate),
    apostolate_name: ticket.apostolateName || null,
    lodging_status: ticket.lodgingStatus || null,
    lodging_location: ticket.lodgingLocation || null,
    transport_status: ticket.transportStatus || null,
    qr_code_data_url: ticket.qrCodeDataUrl || null,
    is_used: Boolean(ticket.isUsed),
    scanned_at: ticket.scannedAt || null,
    scanned_by: ticket.scannedBy || null,
    meals_remaining: ticket.mealsRemaining,
    meal_history: ticket.mealHistory || []
  };
}

function mapRowToTicket(row: any): Ticket {
  return {
    id: row.id,
    orderId: row.order_id,
    ticketCode: row.ticket_code,
    ticketNumber: Number(row.ticket_number),
    ticketType: row.ticket_type,
    attendeeName: row.attendee_name,
    attendeeDocId: row.attendee_doc_id,
    attendeePhone: row.attendee_phone || '',
    attendeeEmail: row.attendee_email || '',
    buyerName: row.buyer_name,
    buyerPhone: row.buyer_phone,
    city: row.city || undefined,
    parish: row.parish || undefined,
    hasApostolate: row.has_apostolate,
    apostolateName: row.apostolate_name || undefined,
    lodgingStatus: row.lodging_status || undefined,
    lodgingLocation: row.lodging_location || undefined,
    transportStatus: row.transport_status || undefined,
    qrCodeDataUrl: row.qr_code_data_url || undefined,
    isUsed: Boolean(row.is_used),
    scannedAt: row.scanned_at || undefined,
    scannedBy: row.scanned_by || undefined,
    mealsRemaining: Number(row.meals_remaining),
    mealHistory: typeof row.meal_history === 'string' ? JSON.parse(row.meal_history) : (row.meal_history || [])
  };
}

// ----------------------------------------------------
// DB Operations
// ----------------------------------------------------

export async function getEventConfig(): Promise<EventConfig> {
  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from('event_config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          eventName: data.event_name,
          subtitle: data.subtitle,
          edition: data.edition,
          dates: data.dates,
          time: data.time,
          venue: data.venue,
          venueAddress: data.venue_address,
          totalQuota: Number(data.total_quota),
          physicalTickets: Number(data.physical_tickets),
          ticketPriceUsd: Number(data.ticket_price_usd),
          currentRateBsEuro: Number(data.current_rate_bs_euro),
          currentRateBsDollar: Number(data.current_rate_bs_dollar),
          description: data.description,
          includesMeals: Boolean(data.includes_meals),
          mealsPerTicket: Number(data.meals_per_ticket),
          congressDays: Number(data.congress_days),
          announcement: data.announcement || undefined,
          paymentDetails: typeof data.payment_details === 'string' ? JSON.parse(data.payment_details) : data.payment_details
        };
      }
    } catch (err) {
      console.warn('Supabase getEventConfig failed, fallback to JSON:', err);
    }
  }

  const db = readDb();
  return db.config;
}

export async function updateEventConfig(updates: Partial<EventConfig>): Promise<EventConfig> {
  if (isSupabaseAvailable()) {
    try {
      const dbPayload: any = { updated_at: new Date().toISOString() };
      if (updates.eventName !== undefined) dbPayload.event_name = updates.eventName;
      if (updates.subtitle !== undefined) dbPayload.subtitle = updates.subtitle;
      if (updates.edition !== undefined) dbPayload.edition = updates.edition;
      if (updates.dates !== undefined) dbPayload.dates = updates.dates;
      if (updates.time !== undefined) dbPayload.time = updates.time;
      if (updates.venue !== undefined) dbPayload.venue = updates.venue;
      if (updates.venueAddress !== undefined) dbPayload.venue_address = updates.venueAddress;
      if (updates.totalQuota !== undefined) dbPayload.total_quota = updates.totalQuota;
      if (updates.physicalTickets !== undefined) dbPayload.physical_tickets = updates.physicalTickets;
      if (updates.ticketPriceUsd !== undefined) dbPayload.ticket_price_usd = updates.ticketPriceUsd;
      if (updates.currentRateBsEuro !== undefined) dbPayload.current_rate_bs_euro = updates.currentRateBsEuro;
      if (updates.currentRateBsDollar !== undefined) dbPayload.current_rate_bs_dollar = updates.currentRateBsDollar;
      if (updates.description !== undefined) dbPayload.description = updates.description;
      if (updates.includesMeals !== undefined) dbPayload.includes_meals = updates.includesMeals;
      if (updates.mealsPerTicket !== undefined) dbPayload.meals_per_ticket = updates.mealsPerTicket;
      if (updates.congressDays !== undefined) dbPayload.congress_days = updates.congressDays;
      if (updates.announcement !== undefined) dbPayload.announcement = updates.announcement;
      if (updates.paymentDetails !== undefined) dbPayload.payment_details = updates.paymentDetails;

      const { data } = await supabase.from('event_config').select('id').limit(1).single();
      if (data?.id) {
        await supabase.from('event_config').update(dbPayload).eq('id', data.id);
      }
    } catch (err) {
      console.warn('Supabase updateEventConfig failed:', err);
    }
  }

  const db = readDb();
  db.config = { ...db.config, ...updates };
  writeDb(db);
  return db.config;
}

export async function getAllOrders(): Promise<Order[]> {
  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map(mapRowToOrder);
      }
    } catch (err) {
      console.warn('Supabase getAllOrders failed, fallback to JSON:', err);
    }
  }

  const db = readDb();
  return db.orders;
}

export async function getAllTickets(): Promise<Ticket[]> {
  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('ticket_number', { ascending: true });

      if (!error && data) {
        return data.map(mapRowToTicket);
      }
    } catch (err) {
      console.warn('Supabase getAllTickets failed, fallback to orders:', err);
    }
  }

  const orders = await getAllOrders();
  const tickets: Ticket[] = [];
  orders.forEach(order => {
    if (order.tickets && Array.isArray(order.tickets)) {
      tickets.push(...order.tickets);
    }
  });
  return tickets;
}

export async function getOrderById(id: string): Promise<Order | null> {
  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return mapRowToOrder(data);
      }
    } catch (err) {
      console.warn('Supabase getOrderById failed, fallback to JSON:', err);
    }
  }

  const db = readDb();
  return db.orders.find((o) => o.id === id) || null;
}

export async function createOrder(data: Partial<Order>): Promise<Order> {
  const config = await getEventConfig();
  const id = generateOrderId();
  const now = new Date().toISOString();

  const newOrder: Order = {
    id,
    createdAt: now,
    buyerName: data.buyerName || '',
    buyerEmail: data.buyerEmail || '',
    buyerPhone: data.buyerPhone || '',
    buyerDocId: data.buyerDocId || '',
    quantity: data.quantity || 1,
    attendees: data.attendees || [],
    paymentMethod: data.paymentMethod || 'cash',
    paymentReference: data.paymentReference || '',
    paymentProofUrl: data.paymentProofUrl || '',
    amountPaid: data.amountPaid || 0,
    currency: data.currency || 'USD',
    convertedUsd: data.convertedUsd || 0,
    rateApplied: data.rateApplied,
    status: data.status || 'pending',
    salesChannel: data.salesChannel || 'online',
    sellerName: data.sellerName,
    tickets: []
  };

  for (let i = 0; i < newOrder.quantity; i++) {
    const attendee = newOrder.attendees[i] || { name: newOrder.buyerName, docId: newOrder.buyerDocId };
    const ticketCode = generateTicketCode(Math.floor(Math.random() * 900) + 100);
    const qrDataUrl = await generateQrCode(ticketCode);

    newOrder.tickets.push({
      id: generateOrderId(),
      orderId: id,
      ticketCode,
      ticketNumber: i + 1,
      ticketType: 'digital',
      attendeeName: attendee.name,
      attendeeDocId: attendee.docId,
      attendeePhone: attendee.phone || newOrder.buyerPhone,
      attendeeEmail: attendee.email || newOrder.buyerEmail,
      buyerName: newOrder.buyerName,
      buyerPhone: newOrder.buyerPhone,
      city: attendee.city,
      parish: attendee.parish,
      hasApostolate: attendee.hasApostolate,
      apostolateName: attendee.apostolateName,
      lodgingStatus: attendee.lodgingStatus,
      lodgingLocation: attendee.lodgingLocation,
      transportStatus: attendee.transportStatus,
      qrCodeDataUrl: qrDataUrl,
      isUsed: false,
      mealsRemaining: config.mealsPerTicket,
      mealHistory: []
    });
  }

  // Insert into Supabase
  if (isSupabaseAvailable()) {
    try {
      await supabase.from('orders').insert(mapOrderToRow(newOrder));
      const ticketRows = newOrder.tickets.map(mapTicketToRow);
      await supabase.from('tickets').insert(ticketRows);
    } catch (err) {
      console.error('Supabase createOrder insert error:', err);
    }
  }

  // Sync to local JSON
  const db = readDb();
  db.orders.push(newOrder);
  writeDb(db);

  return newOrder;
}

export async function updateOrderStatus(id: string, status: OrderStatus, verifiedBy?: string, rejectionReason?: string): Promise<Order | null> {
  const now = new Date().toISOString();

  if (isSupabaseAvailable()) {
    try {
      const updateData: any = { status };
      if (status === 'approved') {
        updateData.verified_at = now;
        updateData.verified_by = verifiedBy || null;
      } else if (status === 'rejected') {
        updateData.rejection_reason = rejectionReason || null;
      }
      await supabase.from('orders').update(updateData).eq('id', id);
    } catch (err) {
      console.error('Supabase updateOrderStatus error:', err);
    }
  }

  const db = readDb();
  const index = db.orders.findIndex((o) => o.id === id);
  if (index !== -1) {
    db.orders[index].status = status;
    if (status === 'approved') {
      db.orders[index].verifiedAt = now;
      db.orders[index].verifiedBy = verifiedBy;
    } else if (status === 'rejected') {
      db.orders[index].rejectionReason = rejectionReason;
    }
    writeDb(db);
    return db.orders[index];
  }

  return getOrderById(id);
}

export async function scanTicket(ticketCode: string, scannedBy: string, mode: 'access' | 'meal'): Promise<ScanResult> {
  let foundOrder: Order | null = null;
  let foundTicket: Ticket | null = null;

  if (isSupabaseAvailable()) {
    try {
      const { data: ticketRow } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_code', ticketCode)
        .maybeSingle();

      if (ticketRow) {
        foundTicket = mapRowToTicket(ticketRow);
        const { data: orderRow } = await supabase
          .from('orders')
          .select('*')
          .eq('id', ticketRow.order_id)
          .maybeSingle();

        if (orderRow) {
          foundOrder = mapRowToOrder(orderRow);
        }
      }
    } catch (err) {
      console.warn('Supabase scanTicket lookup failed:', err);
    }
  }

  // Fallback to local DB if not found in Supabase
  if (!foundTicket || !foundOrder) {
    const db = readDb();
    for (const order of db.orders) {
      const t = order.tickets.find((t) => t.ticketCode === ticketCode);
      if (t) {
        foundOrder = order;
        foundTicket = t;
        break;
      }
    }
  }

  if (!foundTicket || !foundOrder) {
    return { success: false, status: 'not_found', message: 'Entrada no encontrada' };
  }

  if (foundOrder.status !== 'approved') {
    return { success: false, status: 'pending_payment', message: 'La orden no ha sido aprobada', ticket: foundTicket, order: foundOrder };
  }

  const now = new Date();

  if (mode === 'access') {
    if (foundTicket.isUsed) {
      return { success: false, status: 'already_used', message: 'La entrada ya fue utilizada para ingresar', ticket: foundTicket, order: foundOrder };
    }

    foundTicket.isUsed = true;
    foundTicket.scannedAt = now.toISOString();
    foundTicket.scannedBy = scannedBy;

    if (isSupabaseAvailable()) {
      try {
        await supabase
          .from('tickets')
          .update({
            is_used: true,
            scanned_at: now.toISOString(),
            scanned_by: scannedBy
          })
          .eq('ticket_code', ticketCode);

        // Update JSON inside order tickets array
        const updatedTickets = foundOrder.tickets.map(t => t.ticketCode === ticketCode ? foundTicket! : t);
        await supabase.from('orders').update({ tickets: updatedTickets }).eq('id', foundOrder.id);
      } catch (err) {
        console.error('Supabase scanTicket access update error:', err);
      }
    }

    // Local DB update
    const db = readDb();
    const ordIdx = db.orders.findIndex(o => o.id === foundOrder!.id);
    if (ordIdx !== -1) {
      const tIdx = db.orders[ordIdx].tickets.findIndex(t => t.ticketCode === ticketCode);
      if (tIdx !== -1) {
        db.orders[ordIdx].tickets[tIdx].isUsed = true;
        db.orders[ordIdx].tickets[tIdx].scannedAt = now.toISOString();
        db.orders[ordIdx].tickets[tIdx].scannedBy = scannedBy;
        writeDb(db);
      }
    }

    return { success: true, status: 'valid', message: 'Acceso permitido al auditorio', ticket: foundTicket, order: foundOrder };
  } else {
    // Meal mode
    const day = now.getDate();

    if (foundTicket.mealsRemaining <= 0) {
      return { success: false, status: 'no_meals_left', message: 'No le quedan almuerzos disponibles (Saldo: 0)', ticket: foundTicket, order: foundOrder };
    }

    foundTicket.mealsRemaining -= 1;
    foundTicket.mealHistory.push({
      day,
      servedAt: now.toISOString(),
      servedBy: scannedBy
    });

    if (isSupabaseAvailable()) {
      try {
        await supabase
          .from('tickets')
          .update({
            meals_remaining: foundTicket.mealsRemaining,
            meal_history: foundTicket.mealHistory
          })
          .eq('ticket_code', ticketCode);

        const updatedTickets = foundOrder.tickets.map(t => t.ticketCode === ticketCode ? foundTicket! : t);
        await supabase.from('orders').update({ tickets: updatedTickets }).eq('id', foundOrder.id);
      } catch (err) {
        console.error('Supabase scanTicket meal update error:', err);
      }
    }

    // Local DB update
    const db = readDb();
    const ordIdx = db.orders.findIndex(o => o.id === foundOrder!.id);
    if (ordIdx !== -1) {
      const tIdx = db.orders[ordIdx].tickets.findIndex(t => t.ticketCode === ticketCode);
      if (tIdx !== -1) {
        db.orders[ordIdx].tickets[tIdx].mealsRemaining = foundTicket.mealsRemaining;
        db.orders[ordIdx].tickets[tIdx].mealHistory = foundTicket.mealHistory;
        writeDb(db);
      }
    }

    return {
      success: true,
      status: 'valid',
      message: `Almuerzo servido con éxito. Quedan ${foundTicket.mealsRemaining} almuerzos disponibles.`,
      ticket: foundTicket,
      order: foundOrder
    };
  }
}

export async function getPhysicalTickets(): Promise<PhysicalTicket[]> {
  if (isSupabaseAvailable()) {
    try {
      const { data, error } = await supabase
        .from('physical_tickets')
        .select('*')
        .order('number', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row: any) => ({
          number: row.number,
          ticketCode: row.ticket_code,
          qrCodeDataUrl: row.qr_code_data_url || undefined,
          isActivated: Boolean(row.is_activated),
          activatedAt: row.activated_at || undefined,
          activatedBy: row.activated_by || undefined,
          orderId: row.order_id || undefined
        }));
      }
    } catch (err) {
      console.warn('Supabase getPhysicalTickets failed, fallback to JSON:', err);
    }
  }

  const db = readDb();
  return db.physicalTickets;
}

export async function generatePhysicalTickets(): Promise<PhysicalTicket[]> {
  const existing = await getPhysicalTickets();
  if (existing.length > 0) {
    return existing;
  }

  const config = await getEventConfig();
  const qty = config.physicalTickets;
  const newTickets: PhysicalTicket[] = [];

  for (let i = 1; i <= qty; i++) {
    const code = generateTicketCode(i);
    const qr = await generateQrCode(code);
    newTickets.push({
      number: i,
      ticketCode: code,
      qrCodeDataUrl: qr,
      isActivated: false
    });
  }

  if (isSupabaseAvailable()) {
    try {
      const rows = newTickets.map(t => ({
        number: t.number,
        ticket_code: t.ticketCode,
        qr_code_data_url: t.qrCodeDataUrl,
        is_activated: false
      }));
      await supabase.from('physical_tickets').upsert(rows, { onConflict: 'number' });
    } catch (err) {
      console.warn('Supabase generatePhysicalTickets upsert error:', err);
    }
  }

  const db = readDb();
  db.physicalTickets = newTickets;
  writeDb(db);
  return newTickets;
}

export async function activatePhysicalTicket(ticketCode: string, attendeeData: Attendee, activatedBy?: string): Promise<Ticket | null> {
  const config = await getEventConfig();
  let physicalTicket: PhysicalTicket | null = null;

  if (isSupabaseAvailable()) {
    try {
      const { data } = await supabase
        .from('physical_tickets')
        .select('*')
        .eq('ticket_code', ticketCode)
        .maybeSingle();

      if (data) {
        if (data.is_activated) return null; // Already activated
        physicalTicket = {
          number: data.number,
          ticketCode: data.ticket_code,
          qrCodeDataUrl: data.qr_code_data_url || undefined,
          isActivated: false
        };
      }
    } catch (err) {
      console.warn('Supabase activate lookup error:', err);
    }
  }

  if (!physicalTicket) {
    const db = readDb();
    const p = db.physicalTickets.find(t => t.ticketCode === ticketCode);
    if (!p || p.isActivated) return null;
    physicalTicket = p;
  }

  const orderId = generateOrderId();
  const ticketId = generateOrderId();
  const now = new Date().toISOString();
  const qrDataUrl = physicalTicket.qrCodeDataUrl || (await generateQrCode(ticketCode));

  const newTicket: Ticket = {
    id: ticketId,
    orderId,
    ticketCode,
    ticketNumber: physicalTicket.number,
    ticketType: 'physical',
    attendeeName: attendeeData.name,
    attendeeDocId: attendeeData.docId,
    attendeePhone: attendeeData.phone || '',
    attendeeEmail: attendeeData.email || '',
    buyerName: attendeeData.name,
    buyerPhone: attendeeData.phone || '',
    city: attendeeData.city,
    parish: attendeeData.parish,
    hasApostolate: attendeeData.hasApostolate,
    apostolateName: attendeeData.apostolateName,
    lodgingStatus: attendeeData.lodgingStatus,
    lodgingLocation: attendeeData.lodgingLocation,
    transportStatus: attendeeData.transportStatus,
    qrCodeDataUrl: qrDataUrl,
    isUsed: false,
    mealsRemaining: config.mealsPerTicket,
    mealHistory: []
  };

  const newOrder: Order = {
    id: orderId,
    createdAt: now,
    buyerName: attendeeData.name,
    buyerEmail: attendeeData.email || '',
    buyerPhone: attendeeData.phone || '',
    buyerDocId: attendeeData.docId,
    quantity: 1,
    attendees: [attendeeData],
    paymentMethod: 'cash',
    paymentReference: 'PHYSICAL',
    amountPaid: config.ticketPriceUsd,
    currency: 'USD',
    convertedUsd: config.ticketPriceUsd,
    status: 'approved',
    salesChannel: 'physical',
    sellerName: activatedBy,
    verifiedAt: now,
    verifiedBy: activatedBy,
    tickets: [newTicket]
  };

  if (isSupabaseAvailable()) {
    try {
      await supabase.from('orders').insert(mapOrderToRow(newOrder));
      await supabase.from('tickets').insert(mapTicketToRow(newTicket));
      await supabase
        .from('physical_tickets')
        .update({
          is_activated: true,
          activated_at: now,
          activated_by: activatedBy || attendeeData.name,
          order_id: orderId,
          qr_code_data_url: qrDataUrl
        })
        .eq('ticket_code', ticketCode);
    } catch (err) {
      console.error('Supabase activatePhysicalTicket error:', err);
    }
  }

  // Sync to local JSON
  const db = readDb();
  db.orders.push(newOrder);
  const pIndex = db.physicalTickets.findIndex(t => t.ticketCode === ticketCode);
  if (pIndex !== -1) {
    db.physicalTickets[pIndex].isActivated = true;
    db.physicalTickets[pIndex].activatedAt = now;
    db.physicalTickets[pIndex].activatedBy = activatedBy || attendeeData.name;
    db.physicalTickets[pIndex].orderId = orderId;
    db.physicalTickets[pIndex].qrCodeDataUrl = qrDataUrl;
  }
  writeDb(db);

  return newTicket;
}

export async function getTicketByCode(code: string): Promise<{ ticket: Ticket; order: Order } | null> {
  if (isSupabaseAvailable()) {
    try {
      const { data: ticketRow } = await supabase
        .from('tickets')
        .select('*')
        .eq('ticket_code', code)
        .maybeSingle();

      if (ticketRow) {
        const ticket = mapRowToTicket(ticketRow);
        const { data: orderRow } = await supabase
          .from('orders')
          .select('*')
          .eq('id', ticketRow.order_id)
          .maybeSingle();

        if (orderRow) {
          const order = mapRowToOrder(orderRow);
          return { ticket, order };
        }
      }
    } catch (err) {
      console.warn('Supabase getTicketByCode lookup failed:', err);
    }
  }

  const db = readDb();
  for (const order of db.orders) {
    const ticket = order.tickets.find((t) => t.ticketCode === code);
    if (ticket) {
      return { ticket, order };
    }
  }
  return null;
}

export async function getEventStats(): Promise<EventStats> {
  const [config, orders, physicalTickets] = await Promise.all([
    getEventConfig(),
    getAllOrders(),
    getPhysicalTickets()
  ]);

  let totalSoldTickets = 0;
  let confirmedTickets = 0;
  let pendingTickets = 0;
  let pendingOrdersCount = 0;
  let approvedOrdersCount = 0;
  let rejectedOrdersCount = 0;
  let totalRevenueUsd = 0;
  const revenueByMethod = {
    c2p: { totalVes: 0, totalUsd: 0, count: 0 },
    pago_movil: { totalVes: 0, totalUsd: 0, count: 0 },
    cash: { totalUsd: 0, count: 0 }
  };
  let scannedCount = 0;
  let totalMealsServed = 0;
  let totalMealsRemaining = 0;

  orders.forEach((order) => {
    totalSoldTickets += order.quantity;
    if (order.status === 'approved') {
      confirmedTickets += order.quantity;
      approvedOrdersCount++;
      totalRevenueUsd += order.convertedUsd;

      if (order.paymentMethod === 'c2p') {
        revenueByMethod.c2p.count++;
        revenueByMethod.c2p.totalUsd += order.convertedUsd;
        if (order.currency === 'VES') revenueByMethod.c2p.totalVes += order.amountPaid;
      } else if (order.paymentMethod === 'pago_movil') {
        revenueByMethod.pago_movil.count++;
        revenueByMethod.pago_movil.totalUsd += order.convertedUsd;
        if (order.currency === 'VES') revenueByMethod.pago_movil.totalVes += order.amountPaid;
      } else {
        revenueByMethod.cash.count++;
        revenueByMethod.cash.totalUsd += order.convertedUsd;
      }

      order.tickets.forEach((t) => {
        if (t.isUsed) scannedCount++;
        totalMealsServed += (t.mealHistory || []).length;
        totalMealsRemaining += t.mealsRemaining;
      });
    } else if (order.status === 'pending') {
      pendingTickets += order.quantity;
      pendingOrdersCount++;
    } else {
      rejectedOrdersCount++;
    }
  });

  let physicalActivated = 0;
  physicalTickets.forEach((t) => {
    if (t.isActivated) physicalActivated++;
  });

  const physicalPending = config.physicalTickets - physicalActivated;
  const availableTickets = Math.max(0, config.totalQuota - confirmedTickets);
  const pendingScanCount = Math.max(0, confirmedTickets - scannedCount);

  return {
    totalQuota: config.totalQuota,
    totalSoldTickets,
    confirmedTickets,
    pendingTickets,
    availableTickets,
    physicalActivated,
    physicalPending,
    totalOrders: orders.length,
    pendingOrdersCount,
    approvedOrdersCount,
    rejectedOrdersCount,
    totalRevenueUsd,
    revenueByMethod,
    attendance: {
      scannedCount,
      pendingScanCount,
      totalMealsServed,
      totalMealsRemaining
    }
  };
}
