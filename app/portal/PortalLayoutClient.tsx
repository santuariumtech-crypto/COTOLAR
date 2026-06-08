"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, User, FileText, LogOut,
  Menu, X, Bell, ChevronRight,
} from "lucide-react";
import { logout } from "@/app/auth/actions";

const navItems = [
  { href: "/portal", label: "Inicio", icon: LayoutDashboard },
  { href: "/portal/perfil", label: "Mi Perfil", icon: User },
  { href: "/portal/tramites", label: "Trámites", icon: FileText },
];

const BREADCRUMB_MAP: Record<string, string> = {
  "/portal": "Inicio",
  "/portal/perfil": "Mi Perfil",
  "/portal/tramites": "Trámites / Matriculación",
};

type Props = {
  children: React.ReactNode;
  nombre: string;
  apellido: string;
  matricula: string;
  initials: string;
};

export default function PortalLayoutClient({ children, nombre, apellido, matricula, initials }: Props) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const breadcrumb = BREADCRUMB_MAP[pathname] || "Portal";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0f3460] flex flex-col z-30 transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div>
            <span className="text-white font-bold text-lg tracking-tight">COTOLAR</span>
            <p className="text-blue-300 text-[10px] uppercase tracking-widest">Portal Matriculado</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                  ${active
                    ? "bg-[#1abc9c] text-white shadow-lg shadow-teal-500/20"
                    : "text-blue-200 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="h-3 w-3 ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-3 pb-5 border-t border-white/10 pt-4 space-y-3">
          <div className="flex items-center gap-3 px-3">
            <div className="w-9 h-9 rounded-full bg-[#1abc9c] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{nombre} {apellido}</p>
              <p className="text-blue-300 text-[10px] truncate">Mat. N° {matricula}</p>
            </div>
          </div>
          {/* Logout — Server Action via form */}
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-all text-left"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav className="flex items-center gap-1.5 text-sm">
              <span className="text-slate-400">Portal</span>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <span className="font-semibold text-slate-800">{breadcrumb}</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#1abc9c] rounded-full"></span>
            </button>
            <div className="w-9 h-9 rounded-full bg-[#0f3460] flex items-center justify-center text-white font-bold text-sm">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
