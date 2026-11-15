import { Link } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
import { AllSectionsSheet, NAV_ACTIVE_OPTIONS, PRIMARY_LINKS } from "@/components/SiteHeader";

/** Mobile (<768px) bottom tab bar: four primary routes plus "All" (every route, grouped). */
export function MobileTabBar() {
  return (
    <nav className="to-tabbar" aria-label="Primary (mobile)">
      {PRIMARY_LINKS.map((item) => (
        <Link key={item.to} to={item.to} activeOptions={NAV_ACTIVE_OPTIONS}>
          <item.icon size={20} strokeWidth={1.75} aria-hidden="true" />
          <span>{item.label}</span>
        </Link>
      ))}
      <AllSectionsSheet
        side="bottom"
        trigger={
          <button type="button">
            <LayoutGrid size={20} strokeWidth={1.75} aria-hidden="true" />
            <span>All</span>
          </button>
        }
      />
    </nav>
  );
}
