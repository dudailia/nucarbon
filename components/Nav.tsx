"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";

// Mobile-only nav — desktop uses Sidebar
const links: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/ecosystem", label: "Ecosystem" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/simulator", label: "Simulator" },
  { href: "/compare", label: "Compare" },
  { href: "/research", label: "Research" },
  { href: "/livinglab", label: "Living Lab" },
  { href: "/executive", label: "Executive" },
  { href: "/research-agenda", label: "Agenda" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    // Hidden on desktop — Sidebar handles desktop navigation
    <nav className="lg:hidden sticky top-0 z-50 border-b border-green-900/50 bg-[#0a1a0f]/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-13 items-center justify-between gap-3 py-2">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Leaf className="h-5 w-5 text-green-500" />
            <span className="text-base font-bold tracking-tight text-white">
              NU<span className="text-green-500">Carbon</span>
            </span>
          </Link>
          <span className="hidden sm:block shrink-0 rounded-full border border-green-800/60 bg-green-950/70 px-2.5 py-1 text-[10px] font-semibold text-green-500 tracking-wider">
            PROTOTYPE
          </span>
        </div>

        {/* Scrollable link row */}
        <div className="flex gap-0.5 pb-2 overflow-x-auto scrollbar-none">
          {links.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative shrink-0 flex items-center px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  active ? "text-green-400 bg-green-950/60" : "text-gray-500 hover:text-green-300"
                }`}
              >
                {label}
                {active && (
                  <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-green-500" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
