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
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV = [
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
    <header className="site-header sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <span className="brand-mark flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold">
            TO
          </span>
          <span className="brand-wordmark hidden font-semibold tracking-wider sm:block">
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
                className={`nav-link flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                  active ? "active" : ""
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="https://kalilurrahman.lovable.app"
            target="_blank"
            rel="noopener noreferrer"
            className="header-link hidden md:inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            KR Home
          </a>
          <button
            className="header-menu-button xl:hidden flex h-9 w-9 items-center justify-center rounded-md border"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="site-mobile-menu xl:hidden border-t px-4 py-3">
          <div className="grid grid-cols-2 gap-1">
            {NAV.map((item) => {
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
        </div>
      )}
    </header>
  );
}
