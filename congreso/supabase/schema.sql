-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. event_config
CREATE TABLE IF NOT EXISTS event_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  edition TEXT NOT NULL,
  dates TEXT NOT NULL,
  time TEXT NOT NULL,
  venue TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  total_quota INT NOT NULL,
  physical_tickets INT NOT NULL DEFAULT 250,
  ticket_price_usd DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  current_rate_bs_euro DECIMAL(10,2) NOT NULL,
  current_rate_bs_dollar DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  includes_meals BOOLEAN NOT NULL DEFAULT true,
  meals_per_ticket INT NOT NULL DEFAULT 3,
  congress_days INT NOT NULL DEFAULT 3,
  announcement TEXT,
  payment_details JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_doc_id TEXT NOT NULL,
  quantity INT NOT NULL,
  attendees JSONB NOT NULL, -- Array of { name, docId, phone, email }
  payment_method TEXT NOT NULL,
  payment_reference TEXT,
  payment_proof_url TEXT,
  amount_paid DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL,
  converted_usd DECIMAL(10,2) NOT NULL,
  rate_applied DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'pending',
  sales_channel TEXT NOT NULL,
  seller_name TEXT,
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  notes TEXT,
  tickets JSONB NOT NULL -- Will be populated when approved or created directly
);

-- 3. physical_tickets
CREATE TABLE IF NOT EXISTS physical_tickets (
  number INT PRIMARY KEY,
  ticket_code TEXT UNIQUE NOT NULL,
  qr_code_data_url TEXT,
  is_activated BOOLEAN NOT NULL DEFAULT false,
  activated_at TIMESTAMPTZ,
  activated_by TEXT,
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL
);

-- 4. tickets (virtual table or materialized for querying ease, or just store in orders.tickets JSONB? We will create a discrete tickets table for easier querying and updates)
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  ticket_code TEXT UNIQUE NOT NULL,
  ticket_number INT NOT NULL,
  ticket_type TEXT NOT NULL, -- 'physical' | 'digital'
  attendee_name TEXT NOT NULL,
  attendee_doc_id TEXT NOT NULL,
  attendee_phone TEXT,
  attendee_email TEXT,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  qr_code_data_url TEXT,
  is_used BOOLEAN NOT NULL DEFAULT false,
  scanned_at TIMESTAMPTZ,
  scanned_by TEXT,
  meals_remaining INT NOT NULL DEFAULT 3,
  meal_history JSONB NOT NULL DEFAULT '[]'::jsonb -- Array of { day, servedAt, servedBy }
);

-- Disable RLS for now or allow all public access to simplify dev
ALTER TABLE event_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE physical_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

-- Storage
-- Note: Assuming you have a Supabase project, you will create a storage bucket named 'comprobantes'
-- public read access, authenticated or public write access.
