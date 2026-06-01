import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Wallet,
  HardHat,
  FileText,
  StickyNote,
  Sparkles,
  Hammer,
  Home,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/lib/services/auth";
import { getSupabaseProjectsOnly } from "@/lib/services/projects";
import { getStoredProjectId, storeProjectId } from "@/lib/activeProject";
import type { Project } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Tableau de bord", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projets", url: "/projets", icon: FolderKanban },
  { title: "Lots travaux", url: "/lots", icon: Hammer },
  { title: "Tâches", url: "/taches", icon: ListChecks },
  { title: "Budget", url: "/budget", icon: Wallet },
];

const secondaryItems = [
  { title: "Artisans", url: "/artisans", icon: HardHat },
  { title: "Documents & photos", url: "/documents", icon: FileText },
  { title: "Journal chantier", url: "/notes", icon: StickyNote },
  { title: "Copilote IA", url: "/copilote", icon: Sparkles },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) => currentPath === url || currentPath.startsWith(url + "/");
  const { setOpenMobile } = useSidebar();
  const navigate = useNavigate();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    getSupabaseProjectsOnly().then((ps) => {
      setProjects(ps);
      const stored = getStoredProjectId();
      setActiveId(stored ?? ps[0]?.id ?? "");
    });
  }, []);

  function handleProjectChange(id: string) {
    storeProjectId(id);
    setActiveId(id);
    router.invalidate();
  }

  async function handleSignOut() {
    setOpenMobile(false);
    await signOut();
    toast.success("Déconnecté");
    navigate({ to: "/login" });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Home className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-foreground">RenoV Pilot</span>
            <span className="text-xs text-muted-foreground">Pilotage de chantier</span>
          </div>
        </Link>
        {projects.length > 0 && (
          <div className="px-2 pb-1 group-data-[collapsible=icon]:hidden">
            <p className="mb-1 text-xs text-muted-foreground">Projet actif</p>
            <Select value={activeId} onValueChange={handleProjectChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Choisir un projet" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Pilotage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link
                      to={item.url}
                      className="flex items-center gap-2"
                      onClick={() => setOpenMobile(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Ressources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link
                      to={item.url}
                      className="flex items-center gap-2"
                      onClick={() => setOpenMobile(false)}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Déconnexion">
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="px-2 py-1 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
          MVP · Données fictives
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
