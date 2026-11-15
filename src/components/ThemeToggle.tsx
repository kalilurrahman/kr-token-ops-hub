import { useEffect, useState } from "react";
import { Moon, Sparkles, Sun, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DEFAULT_THEME,
  applyTheme,
  isThemeChoice,
  persistTheme,
  readStoredTheme,
  type ThemeChoice,
} from "@/lib/theme";

const OPTIONS: { value: ThemeChoice; label: string; palette: string; icon: LucideIcon }[] = [
  { value: "dark", label: "Dark", palette: "Ledger", icon: Moon },
  { value: "light", label: "Light", palette: "Paper", icon: Sun },
  { value: "bright", label: "Bright", palette: "Bright Pro", icon: Sparkles },
];

export function ThemeToggle() {
  // SSR always renders the default; the head script has already painted the stored palette.
  const [theme, setTheme] = useState<ThemeChoice>(DEFAULT_THEME);

  useEffect(() => {
    const stored = readStoredTheme();
    setTheme(stored);
    applyTheme(stored);
  }, []);

  const choose = (value: string) => {
    if (!isThemeChoice(value)) return;
    setTheme(value);
    applyTheme(value);
    persistTheme(value);
  };

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[0];
  const CurrentIcon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="theme-toggle inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border"
        aria-label={`Theme: ${current.label} (${current.palette}). Change theme`}
        title="Theme"
      >
        <CurrentIcon size={18} strokeWidth={1.75} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="to-theme-menu min-w-[220px]">
        <DropdownMenuLabel className="to-eyebrow">Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={choose}>
          {OPTIONS.map(({ value, label, palette, icon: Icon }) => (
            <DropdownMenuRadioItem key={value} value={value} className="min-h-[44px] gap-3">
              <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
              <span>
                {label} <span className="text-muted-foreground">({palette})</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
