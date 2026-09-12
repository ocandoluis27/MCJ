const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const OUT_DIR = path.join(__dirname, '../entradas_fisicas_qr');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function generateTicketCode(number: number) {
  const hex = Math.floor(Math.random() * 65536).toString(16).padStart(4, '0').toUpperCase();
  const numPad = number.toString().padStart(3, '0');
  return `CONG-${numPad}-${hex}`;
}

async function main() {
  console.log('Generando 250 entradas físicas...');
  const manifest = [];

  for (let i = 1; i <= 250; i++) {
    const code = generateTicketCode(i);
    const url = `https://mariacaminoajesus.org/congreso/registrar/${code}`;
    const filename = `entrada-${i.toString().padStart(3, '0')}.png`;
    const filepath = path.join(OUT_DIR, filename);

    await QRCode.toFile(filepath, url, {
      width: 400,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#0F172A', // Dark Slate 950
        light: '#FFFFFF'
      }
    });

    manifest.push({ number: i, ticketCode: code });
    if (i % 50 === 0) console.log(`Generadas ${i}/250...`);
  }

  fs.writeFileSync(
    path.join(OUT_DIR, 'manifest.json'),
    JSON.stringify({ tickets: manifest }, null, 2)
  );

  console.log('¡Proceso completado exitosamente!');
  console.log(`Archivos guardados en: ${OUT_DIR}`);
}

main().catch(console.error);
