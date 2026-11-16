import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import {
  Menu,
  Search,
  BookOpen,
  Gauge,
  Calculator,
  ChevronDown,
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
  Scale,
  GraduationCap,
  LogIn,
  CircleUserRound,
} from "lucide-react";
import { TokenOpsLogo } from "@/components/TokenOpsLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSupabaseSession } from "@/hooks/use-supabase-session";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export const NAV_GROUPS = ["Start", "Optimize", "Models & tools", "Library", "Learn"] as const;
export type NavGroup = (typeof NAV_GROUPS)[number];

/**
 * Every content route in the app (23). Header, search, mobile "All" sheet and tab bar derive
 * from it. The /auth sign-in page is reached from the header account button instead.
 */
export const FULL_NAV = [
  { to: "/", label: "Home", icon: Gauge, group: "Start" },
  { to: "/hub", label: "Hub", icon: Sparkles, group: "Start" },
  { to: "/guide", label: "Guide", icon: BookOpen, group: "Start" },
  { to: "/sample-chapter", label: "Free Chapter", icon: BookMarked, group: "Start" },
  { to: "/about", label: "About", icon: Info, group: "Start" },
  { to: "/optimize", label: "Optimize", icon: Sparkles, group: "Optimize" },
  { to: "/techniques", label: "Techniques", icon: Layers, group: "Optimize" },
  { to: "/tool-guides", label: "Tool Guides", icon: Wrench, group: "Optimize" },
  { to: "/caveman", label: "Caveman", icon: Zap, group: "Optimize" },
  { to: "/prompt-templates", label: "Prompts", icon: ClipboardList, group: "Optimize" },
  { to: "/patterns", label: "Patterns", icon: Layers, group: "Optimize" },
  { to: "/models", label: "Models", icon: Scale, group: "Models & tools" },
  { to: "/calculator", label: "Calculator", icon: Calculator, group: "Models & tools" },
  { to: "/dashboard", label: "Dashboard", icon: Gauge, group: "Models & tools" },
  { to: "/toolkit", label: "Toolkit", icon: Zap, group: "Models & tools" },
  { to: "/roadmap", label: "Roadmap", icon: MapIcon, group: "Models & tools" },
  { to: "/library", label: "Library", icon: Library, group: "Library" },
  { to: "/reading-lists", label: "Reading Lists", icon: BookMarked, group: "Library" },
  { to: "/templates", label: "Templates", icon: FileText, group: "Library" },
  { to: "/resources", label: "Resources", icon: FolderDown, group: "Library" },
  { to: "/glossary", label: "Glossary", icon: BookMarked, group: "Library" },
  { to: "/sources", label: "Sources", icon: Github, group: "Library" },
  { to: "/training", label: "Training", icon: GraduationCap, group: "Learn" },
] as const satisfies readonly {
  to: string;
  label: string;
  icon: unknown;
  group: NavGroup;
}[];

export type NavItem = (typeof FULL_NAV)[number];

const byTo = (to: NavItem["to"]) => FULL_NAV.find((item) => item.to === to)!;
export const navByGroup = (group: NavGroup) => FULL_NAV.filter((item) => item.group === group);

/** Laptop: Home + four dropdown groups + Training. */
const DROPDOWN_GROUPS: NavGroup[] = ["Start", "Optimize", "Models & tools", "Library"];
/** Tablet: labelled primary links. Mobile tab bar uses the same four. */
export const PRIMARY_LINKS = (["/", "/optimize", "/calculator", "/library"] as const).map(byTo);

/** Exact-path matching so Home is not "current" on every page; TanStack sets aria-current. */
export const NAV_ACTIVE_OPTIONS = { exact: true, includeSearch: false } as const;

export function SiteHeader() {
  const { pathname } = useLocation();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <TokenOpsLogo size={30} showWordmark showTagline={false} className="site-header-logo" />

        {/* Laptop ≥1280: grouped dropdowns */}
        <NavigationMenu.Root className="site-nav site-nav-laptop" aria-label="Primary">
          <NavigationMenu.List className="site-nav-list">
            <NavigationMenu.Item>
              <NavigationMenu.Link asChild active={pathname === "/"}>
                <Link to="/" className="nav-link" activeOptions={NAV_ACTIVE_OPTIONS}>
                  Home
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
            {DROPDOWN_GROUPS.map((group) => {
              const items = navByGroup(group);
              // Home has its own top-level link; only tint a group for its other pages.
              const containsCurrent = items.some((item) => item.to !== "/" && item.to === pathname);
              return (
                <NavigationMenu.Item key={group} className="site-nav-item">
                  <NavigationMenu.Trigger
                    className="nav-link site-nav-trigger"
                    data-current={containsCurrent ? "true" : undefined}
                  >
                    {group}
                    <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" />
                  </NavigationMenu.Trigger>
                  <NavigationMenu.Content className="to-mega">
                    {items.map((item) => (
                      <NavigationMenu.Link key={item.to} asChild active={pathname === item.to}>
                        <Link to={item.to} activeOptions={NAV_ACTIVE_OPTIONS}>
                          <item.icon size={18} strokeWidth={1.75} aria-hidden="true" />
                          <span>{item.label}</span>
                        </Link>
                      </NavigationMenu.Link>
                    ))}
                  </NavigationMenu.Content>
                </NavigationMenu.Item>
              );
            })}
            <NavigationMenu.Item>
              <NavigationMenu.Link asChild active={pathname === "/training"}>
                <Link
                  to="/training"
                  search={{ course: undefined, module: undefined }}
                  className="nav-link"
                  activeOptions={NAV_ACTIVE_OPTIONS}
                >
                  Training
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>

        {/* Tablet 768–1279: labelled primary links */}
        <nav className="site-nav site-nav-tablet" aria-label="Primary">
          {PRIMARY_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-link"
              activeOptions={NAV_ACTIVE_OPTIONS}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="site-header-actions">
          <NavSearch />
          <ThemeToggle />
          <AccountLink />
          <Link to="/calculator" className="to-btn-gold site-header-cta">
            <Calculator size={16} strokeWidth={1.75} aria-hidden="true" />
            Calculator
          </Link>
          <AllSectionsSheet
            side="right"
            trigger={
              <button type="button" className="header-menu-button site-header-menu">
                <Menu size={18} strokeWidth={1.75} aria-hidden="true" />
                <span className="sr-only">All sections</span>
              </button>
            }
          />
        </div>
      </div>
    </header>
  );
}

/** Sign-in (signed out) or account (signed in) link to /auth, returning to the current page. */
function AccountLink() {
  const href = useLocation({ select: (location) => location.href });
  const { session } = useSupabaseSession();
  const signedIn = Boolean(session);
  const label = signedIn
    ? `Account: signed in as ${session?.user.email ?? "you"}`
    : "Sign in for the AI workload adviser";
  const Icon = signedIn ? CircleUserRound : LogIn;
  const onAuthPage = href === "/auth" || href.startsWith("/auth?") || href.startsWith("/auth#");
  return (
    <Link
      to="/auth"
      search={{ redirect: onAuthPage ? undefined : href }}
      className="header-link account-link"
      activeOptions={NAV_ACTIVE_OPTIONS}
      aria-label={label}
      title={label}
      data-signed-in={signedIn ? "true" : undefined}
    >
      <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
    </Link>
  );
}

/** ⌘K / Ctrl+K command palette listing every route. */
function NavSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="to-search-trigger"
          aria-haspopup="dialog"
          aria-label="Search sections"
          aria-keyshortcuts="Meta+K Control+K"
        >
          <Search size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className="to-search-label" aria-hidden="true">
            Search sections
          </span>
          <kbd className="to-kbd" aria-hidden="true">
            ⌘K
          </kbd>
        </button>
      </DialogTrigger>
      <DialogContent className="to-command overflow-hidden p-0">
        <DialogTitle className="sr-only">Search sections</DialogTitle>
        <DialogDescription className="sr-only">
          Type to filter all {FULL_NAV.length} sections, then press Enter to open one.
        </DialogDescription>
        <Command>
          <CommandInput placeholder={`Search ${FULL_NAV.length} sections`} />
          <CommandList>
            <CommandEmpty>No matching section.</CommandEmpty>
            {NAV_GROUPS.map((group) => (
              <CommandGroup key={group} heading={group}>
                {navByGroup(group).map((item) => (
                  <CommandItem
                    key={item.to}
                    value={`${item.label} ${group}`}
                    onSelect={() => {
                      setOpen(false);
                      void navigate({ to: item.to });
                    }}
                  >
                    <item.icon strokeWidth={1.75} aria-hidden="true" />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

/** All 23 routes by group with a filter. Tablet menu (right) and mobile "All" tab (bottom). */
export function AllSectionsSheet({
  side,
  trigger,
}: {
  side: "right" | "bottom";
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NAV_GROUPS.map((group) => ({
      group,
      items: navByGroup(group).filter(
        (item) => !q || item.label.toLowerCase().includes(q) || group.toLowerCase().includes(q),
      ),
    })).filter(({ items }) => items.length > 0);
  }, [query]);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side} className={`to-sheet sheet-${side}`}>
        <SheetTitle className="to-sheet-title">All sections</SheetTitle>
        <SheetDescription className="sr-only">
          Every section of TokenOps Atlas, grouped. Type to filter.
        </SheetDescription>
        <label className="to-sheet-search">
          <Search size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className="sr-only">Filter sections</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${FULL_NAV.length} sections`}
            autoComplete="off"
          />
        </label>
        <nav className="to-sheet-groups" aria-label="All sections">
          {groups.map(({ group, items }) => (
            <section key={group} aria-label={group}>
              <p className="to-eyebrow">{group}</p>
              <div className="to-sheet-chips">
                {items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="to-sheet-chip"
                    activeOptions={NAV_ACTIVE_OPTIONS}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
          {groups.length === 0 && <p className="to-sheet-empty">No matching section.</p>}
        </nav>
        <a
          href="https://kalilurrahman.lovable.app"
          target="_blank"
          rel="noopener noreferrer"
          className="to-sheet-external"
        >
          ↗ KR Home
        </a>
      </SheetContent>
    </Sheet>
  );
}
