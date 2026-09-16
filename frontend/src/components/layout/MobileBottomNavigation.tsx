import { BookOpen, ScrollText, Shield, Sparkles, Store } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";

const navItems = [
  { label: "Log", to: "/app", icon: BookOpen, end: true },
  { label: "Quests", to: "/app/quests", icon: ScrollText },
  { label: "Stats", to: "/app/attributes", icon: Shield },
  { label: "Shop", to: "/app/shop", icon: Store },
  { label: "Activity", to: "/app/activity", icon: Sparkles },
];

export function MobileBottomNavigation() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-vellum/15 bg-coal/95 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 lg:hidden"
      aria-label="Mobile navigation"
    >
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "grid min-h-14 place-items-center border-t-2 border-transparent text-xs font-semibold text-parchment/65 transition hover:bg-vellum/10 hover:text-vellum",
              isActive && "border-ember text-vellum",
            )
          }
        >
          <item.icon className="h-5 w-5 text-ember" aria-hidden="true" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
