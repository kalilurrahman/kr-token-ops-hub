import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X, BookOpen, Gauge, Calculator, Zap, FolderDown, FileText, Layers, Info, Github, Library, Sparkles } from "lucide-react";

const NAV = [
  { to: "/", label: "Home", icon: Gauge },
  { to: "/hub", label: "Hub", icon: Sparkles },
  { to: "/guide", label: "Guide", icon: BookOpen },
  { to: "/patterns", label: "Patterns", icon: Layers },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/dashboard", label: "Dashboard", icon: Gauge },
  { to: "/toolkit", label: "Toolkit", icon: Zap },
  { to: "/resources", label: "Resources", icon: FolderDown },
  { to: "/templates", label: "Templates", icon: FileText },
  { to: "/library", label: "Library", icon: Library },
  { to: "/sources", label: "Sources", icon: Github },
  { to: "/about", label: "About", icon: Info },
] as const;

export function SiteHeader() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(197,160,71,0.18)] bg-[#06090f]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-[#06090f]"
            style={{ background: "linear-gradient(135deg,#9d7f38,#c5a047,#e6c879)" }}
          >
            TO
          </span>
          <span className="hidden font-semibold tracking-wider text-[#f4f1ea] sm:block" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.05rem", letterSpacing: "0.08em" }}>
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
                    ? "bg-[#c5a047]/10 text-[#c5a047] border border-[#c5a047]/40"
                    : "text-[#a89e88] hover:text-[#c5a047] hover:bg-[#c5a047]/5 border border-transparent"
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
            className="hidden md:inline-flex items-center gap-1.5 rounded-md border border-[#c5a047]/40 px-3 py-1.5 text-xs font-medium text-[#c5a047] hover:bg-[#c5a047]/10 transition-colors"
          >
            KR Home
          </a>
          <button
            className="xl:hidden flex h-9 w-9 items-center justify-center rounded-md border border-[rgba(197,160,71,0.18)] text-[#a89e88] hover:text-[#c5a047]"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="xl:hidden border-t border-[rgba(197,160,71,0.18)] bg-[#06090f]/95 px-4 py-3">
          <div className="grid grid-cols-2 gap-1">
            {NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                    active ? "bg-[#c5a047]/10 text-[#c5a047]" : "text-[#a89e88] hover:bg-[#c5a047]/5"
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