import { LogOut } from "lucide-react";
import { useAuth } from "../../features/auth/auth-context";
import { Button } from "../ui/AppButton";

export function TopBar({ title = "Adventurer Dashboard" }: { title?: string }) {
  const { signOut, session } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-vellum/10 bg-ink/80 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase text-ember">Current chapter</p>
          <h1 className="font-display text-xl text-vellum">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden max-w-56 truncate text-sm text-parchment/70 sm:inline">{session?.user.email}</span>
          <Button variant="ghost" onClick={() => void signOut()} aria-label="Sign out">
            <LogOut className="h-5 w-5" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
