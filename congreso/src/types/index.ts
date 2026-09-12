export type PaymentMethod = 'c2p' | 'pago_movil' | 'cash';
export type OrderStatus = 'pending' | 'approved' | 'rejected';
export type Currency = 'USD' | 'VES';
export type SalesChannel = 'online' | 'physical' | 'taquilla';
export type ScanMode = 'access' | 'meal';
export type TicketType = 'physical' | 'digital';

export interface Attendee {
  name: string;
  docId: string;
  phone?: string;
  email?: string;
  city?: string;
  parish?: string;
  hasApostolate?: boolean;
  apostolateName?: string;
  lodgingStatus?: 'local' | 'has_own' | 'needs_lodging';
  lodgingLocation?: string; // sector/zona donde se hospeda o reside
  transportStatus?: 'own_vehicle' | 'needs_transport';
}

export interface Ticket {
  id: string;
  orderId: string;
  ticketCode: string;
  ticketNumber: number;
  ticketType: TicketType;
  attendeeName: string;
  attendeeDocId: string;
  attendeePhone: string;
  attendeeEmail: string;
  buyerName: string;
  buyerPhone: string;
  city?: string;
  parish?: string;
  hasApostolate?: boolean;
  apostolateName?: string;
  lodgingStatus?: 'local' | 'has_own' | 'needs_lodging';
  lodgingLocation?: string;
  transportStatus?: 'own_vehicle' | 'needs_transport';
  qrCodeDataUrl?: string;
  isUsed: boolean;
  scannedAt?: string;
  scannedBy?: string;
  mealsRemaining: number; // starts at 3
  mealHistory: { day: number; servedAt: string; servedBy: string }[];
}

export interface PhysicalTicket {
  number: number; // 1-250
  ticketCode: string;
  qrCodeDataUrl?: string;
  isActivated: boolean;
  activatedAt?: string;
  activatedBy?: string; // name of person who registered
  orderId?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerDocId: string;
  quantity: number;
  attendees: Attendee[];
  paymentMethod: PaymentMethod;
  paymentReference: string;
  paymentProofUrl?: string;
  amountPaid: number;
  currency: Currency;
  convertedUsd: number;
  rateApplied?: number;
  status: OrderStatus;
  salesChannel: SalesChannel;
  sellerName?: string;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
  tickets: Ticket[];
}

export interface EventConfig {
  eventName: string;
  subtitle: string;
  edition: string;
  dates: string; // e.g. "Viernes 5, Sábado 6 y Domingo 7 de Diciembre de 2026"
  time: string;
  venue: string;
  venueAddress: string;
  totalQuota: number;
  physicalTickets: number; // 250
  ticketPriceUsd: number; // starts at 0
  currentRateBsEuro: number;
  currentRateBsDollar: number;
  description: string;
  includesMeals: boolean;
  mealsPerTicket: number; // 3
  congressDays: number; // 3
  announcement?: string;
  paymentDetails: {
    c2p: {
      enabled: boolean;
      bankCode: string;
      phone: string;
      docId: string;
      holder: string;
    };
    pagoMovil: {
      bank: string;
      phone: string;
      docId: string;
      holder: string;
    };
    cash: {
      location: string;
      schedule: string;
    };
  };
}

export interface ScanResult {
  success: boolean;
  status: 'valid' | 'already_used' | 'not_found' | 'pending_payment' | 'meal_served' | 'no_meals_left';
  message: string;
  ticket?: Ticket;
  order?: {
    id: string;
    buyerName: string;
    buyerPhone: string;
    status: OrderStatus;
  };
}

export interface EventStats {
  totalQuota: number;
  totalSoldTickets: number;
  confirmedTickets: number;
  pendingTickets: number;
  availableTickets: number;
  physicalActivated: number;
  physicalPending: number;
  totalOrders: number;
  pendingOrdersCount: number;
  approvedOrdersCount: number;
  rejectedOrdersCount: number;
  totalRevenueUsd: number;
  revenueByMethod: {
    c2p: { totalVes: number; totalUsd: number; count: number };
    pago_movil: { totalVes: number; totalUsd: number; count: number };
    cash: { totalUsd: number; count: number };
  };
  attendance: {
    scannedCount: number;
    pendingScanCount: number;
    totalMealsServed: number;
    totalMealsRemaining: number;
  };
}
