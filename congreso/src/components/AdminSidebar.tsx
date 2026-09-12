'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  QrCode, 
  ScanLine, 
  Utensils, 
  Settings,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Asistentes', href: '/admin/asistentes', icon: Users },
    { name: 'Comprobantes', href: '/admin/comprobantes', icon: FileCheck },
    { name: 'Entradas Físicas', href: '/admin/entradas-fisicas', icon: QrCode },
    { name: 'Escáner Acceso', href: '/escanear', icon: ScanLine },
    { name: 'Escáner Almuerzos', href: '/almuerzos', icon: Utensils },
    { name: 'Configuración', href: '/admin/configuracion', icon: Settings }
  ];

  const sidebarContent = (
    <>
      <div className="p-4 md:p-6 flex items-center justify-between border-b border-slate-800">
        <div>
          <h2 className="text-[#F0C43D] font-bold text-lg tracking-tight">Congreso MCJ</h2>
          <p className="text-xs text-slate-400">Panel Administrativo</p>
        </div>
        <button className="md:hidden text-slate-400" onClick={() => setIsOpen(false)}>
          <X className="h-6 w-6" />
        </button>
      </div>
      <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#1A3E82] text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-[#70B8DF]' : 'text-slate-500'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
        <h1 className="text-[#F0C43D] font-bold">Congreso MCJ — Panel</h1>
        <button onClick={() => setIsOpen(true)} className="text-slate-400">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-950 border-r border-slate-800 z-50 transform transition-transform duration-200 ease-in-out flex flex-col md:translate-x-0 md:static ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
