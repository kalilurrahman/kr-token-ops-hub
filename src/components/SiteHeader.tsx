import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Menu,
  X,
  BookOpen,
  Gauge,
  Calculator,
  Zap,
  FolderDown,
  FileText,
  Layers,
  Info,
  Github,
  Library,
  Sparkles,
  BookMarked,
  Map as MapIcon,
  Wrench,
  ClipboardList,
} from "lucide-react";
import { TokenOpsLogo } from "@/components/TokenOpsLogo";

const PRIMARY_NAV = [
  { to: "/", label: "Home", icon: Gauge },
  { to: "/optimize", label: "Optimize", icon: Sparkles },
  { to: "/techniques", label: "Techniques", icon: Layers },
  { to: "/tool-guides", label: "Tools", icon: Wrench },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/roadmap", label: "Roadmap", icon: MapIcon },
  { to: "/library", label: "Library", icon: Library },
] as const;

const FULL_NAV = [
  { to: "/", label: "Home", icon: Gauge },
  { to: "/hub", label: "Hub", icon: Sparkles },
  { to: "/guide", label: "Guide", icon: BookOpen },
  { to: "/optimize", label: "Optimize", icon: Sparkles },
  { to: "/techniques", label: "Techniques", icon: Layers },
  { to: "/tool-guides", label: "Tool Guides", icon: Wrench },
  { to: "/caveman", label: "Caveman", icon: Zap },
  { to: "/prompt-templates", label: "Prompts", icon: ClipboardList },
  { to: "/patterns", label: "Patterns", icon: Layers },
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/roadmap", label: "Roadmap", icon: MapIcon },
  { to: "/glossary", label: "Glossary", icon: BookMarked },
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
    <header
      className="site-header sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        background: "rgba(8,9,13,0.72)",
        borderColor: "var(--line)",
      }}
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 lg:flex lg:justify-between">
        <TokenOpsLogo size={34} showWordmark showTagline={false} />

        <nav className="hidden items-center gap-1 lg:flex">
          {PRIMARY_NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-all ${
                  active ? "active" : ""
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 justify-self-end">
          <Link
            to="/calculator"
            className="to-btn-gold hidden md:inline-flex items-center gap-1.5 text-xs"
          >
            <Calculator className="h-3.5 w-3.5" />
            Open calculator
          </Link>
          <button
            type="button"
            className="header-menu-button flex h-10 w-10 items-center justify-center rounded-md border"
            style={{ borderColor: "var(--line)", color: "var(--ink)" }}
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="site-mobile-menu border-t px-4 py-4"
          style={{
            background: "rgba(8,9,13,0.96)",
            borderColor: "var(--line)",
            maxHeight: "75vh",
            overflowY: "auto",
          }}
        >
          <p className="to-eyebrow mb-3">// All sections</p>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:grid-cols-4">
            {FULL_NAV.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`nav-link flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                    active ? "active" : ""
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
          <a
            href="https://kalilurrahman.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium"
            style={{ color: "var(--muted)" }}
          >
            ↗ KR Home
          </a>
        </div>
      )}
    </header>
  );
}
