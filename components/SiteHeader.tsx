'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { ThemeToggle } from './theme-toggle';

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
    <header className="dark:bg-slate-950/80 bg-white/80 backdrop-blur-md dark:text-white text-slate-900 sticky top-0 z-50 border-b dark:border-indigo-900/40 border-slate-200 shadow-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        
        {/* Logo y Título */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm group-hover:shadow-md group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-all duration-300 bg-white flex-shrink-0 flex items-center justify-center">
            <img src="/logo.png?v=3" alt="Logo" className="w-full h-full object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg sm:text-2xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Propiedades & Parcelas
            </span>
            <span className="text-[10px] uppercase tracking-widest dark:text-indigo-300 text-indigo-600 font-bold hidden sm:block">
              Vitrina Inmobiliaria
            </span>
          </div>
        </Link>

        {/* Navegación y Botones de Acceso */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/consejos" className="text-xs sm:text-sm font-bold dark:text-slate-300 text-slate-600 dark:hover:text-white hover:text-indigo-600 transition-colors hidden md:block">
            Consejos Inmobiliarios
          </Link>
          <ThemeToggle />
          
          {!isLoaded ? (
            <div className="w-24 h-8 dark:bg-slate-800 bg-slate-200 animate-pulse rounded-lg"></div>
          ) : isSignedIn ? (
            <>
              <Link href="/dashboard" className="text-xs sm:text-sm font-bold dark:text-slate-300 text-slate-600 dark:hover:text-white hover:text-indigo-600 transition-colors">
                Mi Panel
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal" fallbackRedirectUrl="/dashboard">
                <button className="text-xs font-bold dark:text-slate-400 text-slate-500 dark:hover:text-indigo-400 hover:text-indigo-600 transition-colors hidden sm:block">
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
