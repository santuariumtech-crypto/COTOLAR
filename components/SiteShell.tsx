"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const isPortal = pathname?.startsWith("/portal") ?? false;
  const isLogin = pathname?.startsWith("/login") ?? false;
  const isShell = isAdmin || isPortal || isLogin;

  return (
    <>
      {!isShell && <Navbar />}
      <main className={!isShell ? "pt-[calc(2.5rem+4rem)]" : ""}>
        {children}
      </main>
      {!isShell && <Footer />}
      {!isShell && <ChatWidget />}
    </>
  );
}
