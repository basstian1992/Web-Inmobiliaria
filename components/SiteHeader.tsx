'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

export default function SiteHeader() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();

  // No mostrar el header principal en el dashboard o panel de admin
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
    return null;
  }

  // Verificar si el usuario actual es admin (basado en metadata si lo usamos, o solo proveemos el link)
  // Como Clerk no tiene el plan en el JWT por defecto, mostramos el link de Admin si está logueado
  // O simplemente los botones públicos si no lo está.

  return (
    <header className="bg-slate-950/80 backdrop-blur-md text-white sticky top-0 z-50 border-b border-indigo-900/40 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        
        {/* Logo y Título */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500/30 group-hover:border-indigo-400 transition-colors bg-white flex-shrink-0">
            {/* El usuario debe subir logo.png a la carpeta public */}
            <img src="/logo.png" alt="Logo Propiedades y Parcelas" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Propiedades & Parcelas
            </span>
            <span className="text-[9px] uppercase tracking-widest text-indigo-300 font-bold hidden sm:block">
              Vitrina Inmobiliaria
            </span>
          </div>
        </Link>

        {/* Navegación y Botones de Acceso */}
        <div className="flex items-center gap-3 sm:gap-6">
          {!isLoaded ? (
            <div className="w-24 h-8 bg-slate-800 animate-pulse rounded-lg"></div>
          ) : isSignedIn ? (
            <>
              <Link href="/dashboard" className="text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition-colors">
                Mi Panel
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="text-xs font-bold text-slate-400 hover:text-indigo-400 transition-colors hidden sm:block">
                  Ingresar como Administrador
                </button>
              </SignInButton>
              
              <SignUpButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs sm:text-sm py-2 px-4 sm:py-2.5 sm:px-6 rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 uppercase tracking-wide transform hover:-translate-y-0.5">
                  Nuevo Vendedor
                </button>
              </SignUpButton>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
