import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, BookOpen, Gauge, Calculator, Zap, FolderDown, FileText, Layers, Info, Github } from "lucide-react";

const NAV = [
  { to: "/", label: "Home", icon: Gauge },
  { to: "/guide", label: "Guide", icon: BookOpen },
  { to: "/patterns", label: "Patterns", icon: Layers },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/toolkit", label: "Toolkit", icon: Zap },
  { to: "/resources", label: "Resources", icon: FolderDown },
  { to: "/templates", label: "Templates", icon: FileText },
  { to: "/sources", label: "Sources", icon: Github },
  { to: "/about", label: "About", icon: Info },
] as const;

export function SiteHeader() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#2a2c33]/80 bg-[#0b0b0d]/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-[#0b0b0d]"
            style={{ background: "linear-gradient(135deg,#a07a17,#d4af37,#f0d278)" }}
          >
            TO
          </span>
          <span className="hidden font-semibold tracking-wider text-[#f5f1e6] sm:block" style={{ fontFamily: "'Playfair Display', serif" }}>
            TOKENOPS ATLAS
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? "bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30"
                    : "text-[#9aa0aa] hover:text-[#d4af37] hover:bg-white/5 border border-transparent"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://kalilurrahman.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-[#d4af37]/30 px-3 py-1.5 text-xs font-medium text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
          >
            KR Home
          </a>
          <button
            className="xl:hidden flex h-9 w-9 items-center justify-center rounded-md border border-[#2a2c33] text-[#9aa0aa] hover:text-[#d4af37]"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="xl:hidden border-t border-[#2a2c33] bg-[#0b0b0d]/95 px-4 py-3">
          <div className="grid grid-cols-2 gap-1">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                    active ? "bg-[#d4af37]/10 text-[#d4af37]" : "text-[#9aa0aa] hover:bg-white/5"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}