'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-slate-950/95 backdrop-blur-md border-b border-white/10 py-3 shadow-lg' 
          : 'bg-transparent py-5'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link 
          href="/" 
          className="text-white font-bold text-xl tracking-tight flex items-center gap-2 group"
        >
          <span className="text-gold transition-transform group-hover:scale-105">
            María Camino a Jesús
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
            Inicio
          </Link>
          <Link href="/#congreso" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
            Congreso
          </Link>
          <Link href="/#contacto" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
            Contacto
          </Link>
          <Link 
            href="/comprar" 
            className="bg-gold hover:bg-gold/90 text-slate-950 font-bold px-6 py-2.5 rounded-full transition-all active:scale-[0.98] shadow-md shadow-gold/20"
          >
            Comprar Entrada
          </Link>
        </nav>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Panel */}
      <div 
        className={cn(
          'fixed inset-0 top-[60px] bg-slate-950/98 backdrop-blur-xl transition-transform duration-300 md:hidden flex flex-col pt-8 px-6 gap-6',
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <Link 
          href="/" 
          className="text-white/90 text-xl font-medium border-b border-white/10 pb-4"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Inicio
        </Link>
        <Link 
          href="/#congreso" 
          className="text-white/90 text-xl font-medium border-b border-white/10 pb-4"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Congreso
        </Link>
        <Link 
          href="/#contacto" 
          className="text-white/90 text-xl font-medium border-b border-white/10 pb-4"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Contacto
        </Link>
        <Link 
          href="/comprar" 
          className="bg-gold text-slate-950 text-center text-lg font-bold px-6 py-4 rounded-xl mt-4 active:scale-[0.98] transition-transform"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          Comprar Entrada
        </Link>
      </div>
    </header>
  );
}
