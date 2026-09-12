const https = require('https');

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

async function main() {
  console.log(`Configurando bucket de almacenamiento 'comprobantes' en [${PROJECT_REF}]...`);
  const sql = `
    INSERT INTO storage.buckets (id, name, public) 
    VALUES ('comprobantes', 'comprobantes', true) 
    ON CONFLICT (id) DO UPDATE SET public = true;

    -- Politicas para permitir lectura y subida publica
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public select comprobantes'
      ) THEN
        CREATE POLICY "Allow public select comprobantes" ON storage.objects FOR SELECT USING (bucket_id = 'comprobantes');
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow public insert comprobantes'
      ) THEN
        CREATE POLICY "Allow public insert comprobantes" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'comprobantes');
      END IF;
    END $$;

    SELECT id, name, public FROM storage.buckets;
  `;

  const res = await queryProject(PROJECT_REF, sql);
  console.log('Resultado configuracion storage:', JSON.stringify(res, null, 2));
}

main().catch(console.error);
