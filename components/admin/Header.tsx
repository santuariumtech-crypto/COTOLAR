"use client";

import { Search, User } from "lucide-react";
import NotificationBell from "@/components/portal/NotificationBell";

export default function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-20 items-center justify-between bg-white/80 px-8 backdrop-blur-lg border-b border-slate-200 shadow-sm transition-all">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Buscar..."
            className="h-11 rounded-full border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 w-64 focus:w-80"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <NotificationBell />

        <div className="h-8 w-[1px] bg-slate-200"></div>

        <button className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-all hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-100 border border-transparent hover:border-slate-200">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md">
            <User className="h-5 w-5" />
          </div>
          <div className="flex flex-col items-start hidden sm:flex">
            <span className="text-sm font-medium text-slate-700">Admin</span>
            <span className="text-xs text-slate-400">admin@cto.org</span>
          </div>
        </button>
      </div>
    </header>
  );
}
