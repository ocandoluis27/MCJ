import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-4">
            <h3 className="text-gold font-bold text-xl">María Camino a Jesús</h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              Asociación pública de fieles con sede en la Arquidiócesis de Maracaibo, dedicada a la devoción a Jesús Misericordioso y María.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/comprar" className="text-white/60 hover:text-white text-sm transition-colors">
                  Adquirir Entrada
                </Link>
              </li>
              <li>
                <a href="https://mariacaminoajesus.org" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white text-sm transition-colors">
                  Sitio Web Oficial
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Redes Sociales</h4>
            <div className="flex flex-col gap-2">
              <a 
                href="https://instagram.com/mariacaminoajesus" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                Instagram
              </a>
              <a 
                href="https://youtube.com/mariacaminoajesus" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                YouTube
              </a>
            </div>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 text-center md:flex md:justify-between md:items-center">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} Asociación María Camino a Jesús. Todos los derechos reservados.
          </p>
          <p className="text-white/40 text-sm mt-2 md:mt-0">
            Maracaibo, Venezuela.
          </p>
        </div>
      </div>
    </footer>
  );
}
