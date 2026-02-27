import { Outlet } from "react-router";
import { Toaster } from "@/components/ui/sonner";
import { AppHeader } from "./AppHeader";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { useSwipeNavigation } from "@/hooks/use-swipe-navigation";

export function AppShell() {
  useSwipeNavigation();

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppHeader />
      <main className="flex-1 overflow-auto px-6 pb-6 pt-16">
        <Outlet />
      </main>
      <CommandPalette />
      <Toaster />
    </div>
  );
}
