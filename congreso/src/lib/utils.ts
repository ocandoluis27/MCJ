import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: 'USD' | 'VES' = 'USD') {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('es-VE', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(dateString));
}

export function generateOrderId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateTicketCode(number: number): string {
  // Format: CONG-{3-digit-number}-{4-char-hex}
  const hex = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0').toUpperCase();
  const numPad = number.toString().padStart(3, '0');
  return `CONG-${numPad}-${hex}`;
}

export function cleanPhoneForWhatsApp(phone: string): string {
  // Remove all non-numeric characters
  const clean = phone.replace(/\D/g, '');
  // Ensure it starts with 58 (Venezuela code) for WhatsApp
  if (clean.startsWith('0')) {
    return `58${clean.substring(1)}`;
  }
  if (!clean.startsWith('58') && clean.length === 10) {
    return `58${clean}`;
  }
  return clean;
}
