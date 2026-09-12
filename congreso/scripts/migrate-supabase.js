const https = require('https');
const fs = require('fs');
const path = require('path');

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECT_REF = 'egufqfnfpnzwpubvjngz';

function queryProject(ref, sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      port: 443,
      path: `/v1/projects/${ref}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Storage bucket creator via REST
function createStorageBucket(anonKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      id: 'comprobantes',
      name: 'comprobantes',
      public: true
    });

    const req = https.request({
      hostname: `${PROJECT_REF}.supabase.co`,
      port: 443,
      path: `/storage/v1/bucket`,
      method: 'POST',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log(`Iniciando migración en Supabase [${PROJECT_REF}]...`);

  // 1. Borrar todas las tablas del proyecto Bytebridge
  console.log('1. Eliminando tablas anteriores de Bytebridge...');
  const dropSQL = `
    DROP TABLE IF EXISTS bytebridge_payments CASCADE;
    DROP TABLE IF EXISTS bytebridge_businesses CASCADE;
    DROP TABLE IF EXISTS payments CASCADE;
    DROP TABLE IF EXISTS leads CASCADE;
    DROP TABLE IF EXISTS tickets CASCADE;
    DROP TABLE IF EXISTS physical_tickets CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS event_config CASCADE;
  `;
  const dropRes = await queryProject(PROJECT_REF, dropSQL);
  console.log('Tablas antiguas eliminadas:', dropRes);

  // 2. Crear el nuevo esquema completo del Congreso
  console.log('2. Creando nuevo esquema del Congreso María Camino a Jesús...');
  const schemaSQL = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    -- Tabla de Configuración del Evento
    CREATE TABLE event_config (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      event_name TEXT NOT NULL,
      subtitle TEXT NOT NULL,
      edition TEXT NOT NULL,
      dates TEXT NOT NULL,
      time TEXT NOT NULL,
      venue TEXT NOT NULL,
      venue_address TEXT NOT NULL,
      total_quota INT NOT NULL DEFAULT 1200,
      physical_tickets INT NOT NULL DEFAULT 250,
      ticket_price_usd DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      current_rate_bs_euro DECIMAL(10,2) NOT NULL DEFAULT 49.20,
      current_rate_bs_dollar DECIMAL(10,2) NOT NULL DEFAULT 45.50,
      description TEXT NOT NULL,
      includes_meals BOOLEAN NOT NULL DEFAULT true,
      meals_per_ticket INT NOT NULL DEFAULT 3,
      congress_days INT NOT NULL DEFAULT 3,
      announcement TEXT,
      payment_details JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Tabla de Órdenes
    CREATE TABLE orders (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      buyer_name TEXT NOT NULL,
      buyer_email TEXT,
      buyer_phone TEXT NOT NULL,
      buyer_doc_id TEXT NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      attendees JSONB NOT NULL,
      payment_method TEXT NOT NULL,
      payment_reference TEXT,
      payment_proof_url TEXT,
      amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      currency TEXT NOT NULL DEFAULT 'USD',
      converted_usd DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      rate_applied DECIMAL(10,2),
      status TEXT NOT NULL DEFAULT 'pending',
      sales_channel TEXT NOT NULL DEFAULT 'online',
      seller_name TEXT,
      rejection_reason TEXT,
      verified_at TIMESTAMPTZ,
      verified_by TEXT,
      notes TEXT,
      tickets JSONB NOT NULL DEFAULT '[]'::jsonb
    );

    -- Tabla de Entradas Físicas
    CREATE TABLE physical_tickets (
      number INT PRIMARY KEY,
      ticket_code TEXT UNIQUE NOT NULL,
      qr_code_data_url TEXT,
      is_activated BOOLEAN NOT NULL DEFAULT false,
      activated_at TIMESTAMPTZ,
      activated_by TEXT,
      order_id TEXT REFERENCES orders(id) ON DELETE SET NULL
    );

    -- Tabla de Tickets Individuales (Acceso y Almuerzos)
    CREATE TABLE tickets (
      id TEXT PRIMARY KEY,
      order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
      ticket_code TEXT UNIQUE NOT NULL,
      ticket_number INT NOT NULL,
      ticket_type TEXT NOT NULL DEFAULT 'digital',
      attendee_name TEXT NOT NULL,
      attendee_doc_id TEXT NOT NULL,
      attendee_phone TEXT,
      attendee_email TEXT,
      buyer_name TEXT NOT NULL,
      buyer_phone TEXT NOT NULL,
      city TEXT,
      parish TEXT,
      has_apostolate BOOLEAN DEFAULT false,
      apostolate_name TEXT,
      lodging_status TEXT,
      lodging_location TEXT,
      transport_status TEXT,
      qr_code_data_url TEXT,
      is_used BOOLEAN NOT NULL DEFAULT false,
      scanned_at TIMESTAMPTZ,
      scanned_by TEXT,
      meals_remaining INT NOT NULL DEFAULT 3,
      meal_history JSONB NOT NULL DEFAULT '[]'::jsonb
    );

    -- Permisos públicos y deshabilitar RLS para acceso API directo
    ALTER TABLE event_config DISABLE ROW LEVEL SECURITY;
    ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
    ALTER TABLE physical_tickets DISABLE ROW LEVEL SECURITY;
    ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

    -- Insertar configuración inicial oficial
    INSERT INTO event_config (
      event_name,
      subtitle,
      edition,
      dates,
      time,
      venue,
      venue_address,
      total_quota,
      physical_tickets,
      ticket_price_usd,
      current_rate_bs_euro,
      current_rate_bs_dollar,
      description,
      includes_meals,
      meals_per_ticket,
      congress_days,
      payment_details
    ) VALUES (
      'Congreso Gracia y Misericordia',
      '«Llamó a los que quiso para que estuvieran con Él» — Marcos 3, 13',
      'Asociación Pública de Fieles María Camino a Jesús',
      '16 al 18 de Octubre de 2026',
      'Viernes 16 al Domingo 18 de Octubre de 2026',
      'Centro de Arte de Maracaibo Lía Bermúdez',
      'Casco Central, Plaza Baralt, Maracaibo, Estado Zulia',
      1200,
      250,
      0.00,
      49.20,
      45.50,
      'Tres días de gracia, misericordia y formación espiritual con sacerdotes y religiosas invitadas en el Centro de Arte Lía Bermúdez.',
      true,
      3,
      3,
      '{"c2p": {"phone": "04140000000", "docId": "J-123456789", "holder": "Asociación María Camino a Jesús", "enabled": true, "bankCode": "0134"}, "cash": {"location": "Sede Principal y Taquilla CAMLB", "schedule": "8:00 AM - 4:00 PM"}, "pagoMovil": {"bank": "Banesco (0134)", "docId": "J-123456789", "phone": "04140000000", "holder": "Asociación María Camino a Jesús"}}'::jsonb
    );
  `;

  const schemaRes = await queryProject(PROJECT_REF, schemaSQL);
  console.log('Esquema creado con éxito:', schemaRes);

  // 3. Poblar las 250 entradas físicas desde el manifest
  console.log('3. Registrando las 250 entradas físicas pre-generadas...');
  const manifestPath = path.join(__dirname, '../entradas_fisicas_qr/manifest.json');
  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const ticketsList = manifest.tickets || [];
    
    // Insertar en lotes de 50
    for (let i = 0; i < ticketsList.length; i += 50) {
      const batch = ticketsList.slice(i, i + 50);
      const values = batch.map(t => `(${t.number}, '${t.ticketCode}', false)`).join(', ');
      const insertSQL = `INSERT INTO physical_tickets (number, ticket_code, is_activated) VALUES ${values} ON CONFLICT (number) DO NOTHING;`;
      await queryProject(PROJECT_REF, insertSQL);
    }
    console.log(`¡${ticketsList.length} entradas físicas vinculadas en base de datos!`);
  }

  // 4. Verificar tablas creadas
  console.log('4. Verificando tablas finales en public...');
  const verifyRes = await queryProject(PROJECT_REF, "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
  console.log('Tablas activas:', verifyRes);

  console.log('\n✅ ¡Migración de Supabase completada con éxito!');
}

main().catch(console.error);
