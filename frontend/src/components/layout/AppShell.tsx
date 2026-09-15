import type { ReactNode } from "react";
import { DesktopSidebar } from "./DesktopSidebar";
import { MobileBottomNavigation } from "./MobileBottomNavigation";
import { TopBar } from "./TopBar";

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <div className="min-h-screen bg-transparent text-vellum">
      <DesktopSidebar />
      <div className="min-h-screen lg:pl-72">
        <TopBar title={title} />
        <div className="pb-24 lg:pb-8">{children}</div>
      </div>
      <MobileBottomNavigation />
    </div>
  );
}
