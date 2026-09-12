import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Congreso Gracia y Misericordia · María Camino a Jesús',
  description: 'Congreso Gracia y Misericordia 2026 en el Centro de Arte Lía Bermúdez de Maracaibo. 16 al 18 de Octubre de 2026.',
  openGraph: {
    title: 'Congreso Gracia y Misericordia 2026',
    description: '«Llamó a los que quiso para que estuvieran con Él» (Mc 3, 13). Centro de Arte Lía Bermúdez, Maracaibo.',
    images: ['/images/afiche-congreso.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${outfit.variable}`}>
      <body className="antialiased min-h-screen bg-slate-950 text-slate-50 font-sans flex flex-col selection:bg-gold/30">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
