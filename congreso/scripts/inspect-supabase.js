const https = require('https');

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN || '';
const PROJECTS = ['egufqfnfpnzwpubvjngz', 'kjmuynssmfpomkympltb'];

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
  for (const ref of PROJECTS) {
    console.log(`=== Proyecto ${ref} ===`);
    const tables = await queryProject(ref, "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
    console.log('Tablas:', JSON.stringify(tables, null, 2));
  }
}

main().catch(console.error);
