"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Mail, Settings, LogOut, Activity, Image, FileText } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Matriculados", href: "/admin/matriculados", icon: Users },
  { name: "Trámites", href: "/admin/tramite", icon: FileText },
  { name: "Mensajes", href: "/admin/mensajes", icon: Mail },
  { name: "Imágenes", href: "/admin/imagenes", icon: Image },
  { name: "Configuración", href: "/admin/settings", icon: Settings },
];


export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-950 text-slate-300 shadow-2xl transition-all duration-300 border-r border-slate-800">
      <div className="flex h-20 items-center gap-3 px-6 bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">CTO Admin</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="flex flex-col gap-2">
          {navigation.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isActive ? "scale-110" : "group-hover:scale-110 text-slate-400 group-hover:text-blue-400"
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800/80">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-400"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </Link>
      </div>
    </div>
  );
}
