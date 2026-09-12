const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length > 0) env[k.trim()] = v.join('=').trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: config, error: configErr } = await supabase.from('event_config').select('*').limit(1);
  if (configErr) {
    console.error('Error fetching event_config:', configErr);
  } else {
    console.log('event_config fetched successfully:', config ? config.length : 0, 'rows');
    if (config && config[0]) {
      console.log('Event Name:', config[0].event_name);
      console.log('Total Quota:', config[0].total_quota);
    }
  }

  const { count, error: countErr } = await supabase.from('physical_tickets').select('*', { count: 'exact', head: true });
  if (countErr) {
    console.error('Error counting physical_tickets:', countErr);
  } else {
    console.log('Total physical_tickets in Supabase:', count);
  }

  const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
  if (bErr) {
    console.error('Error listing buckets:', bErr);
  } else {
    console.log('Storage buckets:', buckets ? buckets.map(b => b.name) : []);
  }
}

test().catch(console.error);
