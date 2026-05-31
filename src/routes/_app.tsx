import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const titles: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/projets": "Projets",
  "/lots": "Lots travaux",
  "/taches": "Tâches",
  "/budget": "Budget",
  "/artisans": "Artisans",
  "/documents": "Documents & photos",
  "/notes": "Décisions chantier",
  "/copilote": "Copilote IA",
};

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title =
    titles[pathname] ?? (pathname.startsWith("/projets/") ? "Détail projet" : "RenoV Pilot");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-5" />
            <h2 className="text-sm font-medium text-foreground">{title}</h2>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </main>
        </SidebarInset>
      </div>
      <Toaster richColors position="bottom-right" />
    </SidebarProvider>
  );
}
