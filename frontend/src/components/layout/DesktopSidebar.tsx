import { BookOpen, ScrollText, Shield, Sparkles, Store } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";

const navItems = [
  { label: "Chronicle", to: "/app", icon: BookOpen, end: true },
  { label: "Quests", to: "/app/quests", icon: ScrollText },
  { label: "Attributes", to: "/app/attributes", icon: Shield },
  { label: "Shop", to: "/app/shop", icon: Store },
  { label: "Activity", to: "/app/activity", icon: Sparkles },
];

export function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-vellum/15 bg-coal/95 px-5 py-6 lg:block">
      <NavLink to="/" className="block">
        <span className="font-display text-2xl font-bold tracking-normal text-vellum">Life <span className="text-ember">RPG</span></span>
        <span className="mt-1 block text-xs font-bold uppercase tracking-[0.16em] text-parchment/55">Character interface</span>
      </NavLink>
      <nav className="mt-10 grid gap-2" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "flex min-h-11 items-center gap-3 border-l-2 border-transparent px-3 text-sm font-semibold text-parchment/75 transition hover:bg-vellum/10 hover:text-vellum",
                isActive && "border-ember bg-vellum/10 text-vellum",
              )
            }
          >
            <item.icon className="h-5 w-5 text-ember" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="absolute bottom-6 left-5 right-5 border border-ember/25 bg-ink/55 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-ember">Your record</p>
        <p className="mt-2 text-sm text-parchment/75">The actions you repeat are the character you build.</p>
      </div>
    </aside>
  );
}
