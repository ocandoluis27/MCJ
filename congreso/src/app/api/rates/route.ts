import { NextResponse } from 'next/server';

let cachedRates = { euroRate: 45.5, dollarRate: 42.5, updatedAt: 0 };
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export async function GET() {
  const now = Date.now();
  if (now - cachedRates.updatedAt < CACHE_DURATION) {
    return NextResponse.json(cachedRates);
  }

  try {
    const [euroRes, dollarRes] = await Promise.all([
      fetch('https://ve.dolarapi.com/v1/dolares/oficial'),
      fetch('https://ve.dolarapi.com/v1/euros/oficial')
    ]);
    
    let dollarRate = cachedRates.dollarRate;
    let euroRate = cachedRates.euroRate;

    if (dollarRes.ok) {
      const data = await dollarRes.json();
      dollarRate = data.promedio || data.precio || dollarRate;
    }
    if (euroRes.ok) {
      const data = await euroRes.json();
      euroRate = data.promedio || data.precio || euroRate;
    }

    cachedRates = { euroRate, dollarRate, updatedAt: now };
    return NextResponse.json(cachedRates);
  } catch (error) {
    console.error('Error fetching rates:', error);
    return NextResponse.json(cachedRates); // Return stale cache
  }
}
