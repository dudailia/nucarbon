"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Leaf,
  Activity,
  LayoutGrid,
  BarChart2,
  SlidersHorizontal,
  MapPin,
  BookOpen,
  Building2,
  FileText,
  ClipboardList,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/",                label: "Home",            Icon: Activity,          group: "main" },
  { href: "/ecosystem",       label: "Ecosystem",       Icon: LayoutGrid,        group: "main" },
  { href: "/benchmarks",      label: "Benchmarks",      Icon: BarChart2,         group: "main" },
  { href: "/simulator",       label: "Simulator",       Icon: SlidersHorizontal, group: "main" },
  { href: "/compare",         label: "Compare",         Icon: MapPin,            group: "main" },
  { href: "/research",        label: "Research",        Icon: BookOpen,          group: "main" },
  { href: "/livinglab",       label: "Living Lab",      Icon: Building2,         group: "main" },
  { href: "/executive",       label: "Executive Brief", Icon: FileText,          group: "secondary" },
  { href: "/research-agenda", label: "Agenda",          Icon: ClipboardList,     group: "secondary" },
  { href: "/about",           label: "About",           Icon: Info,              group: "secondary" },
];

type Props = { open: boolean; onToggle: () => void };

export default function Sidebar({ open, onToggle }: Props) {
  const pathname = usePathname();
  const W = open ? 232 : 64;

  return (
    <aside
      className="no-print fixed left-0 top-0 z-40 hidden h-screen lg:flex flex-col border-r border-green-900/30 bg-[#060f08] overflow-hidden"
      style={{ width: W, transition: "width 300ms cubic-bezier(0.4,0,0.2,1)" }}
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center border-b border-green-900/25 px-[18px] gap-3 overflow-hidden">
        <div className="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-green-950/60 border border-green-800/40">
          <Leaf className="h-3.5 w-3.5 text-green-400" />
        </div>
        <span
          className="whitespace-nowrap text-base font-black text-white tracking-tight transition-opacity duration-200"
          style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
        >
          NU<span className="text-green-400">Carbon</span>
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 px-2">
        {NAV_ITEMS.filter((i) => i.group === "main").map(({ href, label, Icon }) => (
          <NavItem key={href} href={href} label={label} Icon={Icon}
            active={pathname === href} open={open} />
        ))}

        <div className="my-2 h-px bg-green-900/20" />

        {NAV_ITEMS.filter((i) => i.group === "secondary").map(({ href, label, Icon }) => (
          <NavItem key={href} href={href} label={label} Icon={Icon}
            active={pathname === href} open={open} />
        ))}
      </nav>

      {/* Data freshness footer */}
      <div
        className="shrink-0 border-t border-green-900/20 px-[18px] py-3 overflow-hidden transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0, height: open ? "auto" : 0, padding: open ? undefined : 0 }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-green-900 mb-1">Data Model</p>
        <p className="text-[11px] text-gray-700">Last updated: May 2026</p>
        <p className="text-[11px] text-gray-700">Methodology: IEA 2024</p>
      </div>

      {/* Collapse button */}
      <button
        onClick={onToggle}
        className="shrink-0 flex h-10 items-center border-t border-green-900/25 px-[18px] gap-3 text-gray-600 hover:text-green-400 hover:bg-green-950/20 transition-colors overflow-hidden"
      >
        <span className="shrink-0">
          {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
        <span
          className="whitespace-nowrap text-xs font-medium transition-opacity duration-200"
          style={{ opacity: open ? 1 : 0 }}
        >
          Collapse sidebar
        </span>
      </button>
    </aside>
  );
}

function NavItem({
  href, label, Icon, active, open,
}: {
  href: string; label: string;
  Icon: React.ElementType; active: boolean; open: boolean;
}) {
  return (
    <Link
      href={href}
      title={!open ? label : undefined}
      className={`group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors overflow-hidden ${
        active
          ? "bg-green-950/60 text-green-400"
          : "text-gray-500 hover:bg-green-950/30 hover:text-green-300"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-green-500" />
      )}
      <Icon className="shrink-0 h-4 w-4" />
      <span
        className="whitespace-nowrap transition-opacity duration-200"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
      >
        {label}
      </span>
      {/* Tooltip when collapsed */}
      {!open && (
        <span className="pointer-events-none absolute left-full ml-2 z-50 rounded-md border border-green-800/40 bg-[#0a1a0f] px-2.5 py-1 text-xs text-gray-300 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 whitespace-nowrap">
          {label}
        </span>
      )}
    </Link>
  );
}
