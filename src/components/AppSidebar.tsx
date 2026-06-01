import { Link, useNavigate, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, FolderKanban, ListChecks, Wallet,
  HardHat, FileText, StickyNote, Sparkles, Hammer, Home, LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { signOut } from "@/lib/services/auth";
import { getSupabaseProjectsOnly } from "@/lib/services/projects";
import { getStoredProjectId, storeProjectId } from "@/lib/activeProject";
import type { Project } from "@/lib/types";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

type Section = "dashboard" | "lots" | "taches" | "budget" | "artisans" | "documents" | "journal";

const mainSections: { title: string; section: Section; icon: typeof LayoutDashboard }[] = [
  { title: "Tableau de bord", section: "dashboard", icon: LayoutDashboard },
  { title: "Lots travaux", section: "lots", icon: Hammer },
  { title: "Tâches", section: "taches", icon: ListChecks },
  { title: "Budget", section: "budget", icon: Wallet },
];

const resourceSections: { title: string; section: Section; icon: typeof LayoutDashboard }[] = [
  { title: "Artisans", section: "artisans", icon: HardHat },
  { title: "Documents & photos", section: "documents", icon: FileText },
  { title: "Journal chantier", section: "journal", icon: StickyNote },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
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
    const sectionMatch = currentPath.match(/\/projets\/[^/]+\/([^/]+)/);
    const section = (sectionMatch?.[1] as Section | undefined) ?? "dashboard";
    navigate({ to: `/projets/${id}/${section}` as any });
  }

  async function handleSignOut() {
    setOpenMobile(false);
    await signOut();
    toast.success("Déconnecté");
    navigate({ to: "/login" });
  }

  const isProjectSection = (section: Section) =>
    activeId
      ? currentPath === `/projets/${activeId}/${section}` ||
        currentPath.startsWith(`/projets/${activeId}/${section}/`)
      : false;

  function ProjectSectionLink({ section, children }: { section: Section; children: React.ReactNode }) {
    if (activeId) {
      return (
        <Link to={`/projets/${activeId}/${section}` as any} onClick={() => setOpenMobile(false)}>
          {children}
        </Link>
      );
    }
    return (
      <Link to="/projets" onClick={() => setOpenMobile(false)}>
        {children}
      </Link>
    );
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
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={currentPath === "/projets" || currentPath.startsWith("/projets/")}
                  tooltip="Projets"
                >
                  <Link to="/projets" onClick={() => setOpenMobile(false)}>
                    <FolderKanban className="h-4 w-4" />
                    <span>Projets</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {mainSections.map(({ title, section, icon: Icon }) => (
                <SidebarMenuItem key={section}>
                  <SidebarMenuButton asChild isActive={isProjectSection(section)} tooltip={title}>
                    <ProjectSectionLink section={section}>
                      <Icon className="h-4 w-4" />
                      <span>{title}</span>
                    </ProjectSectionLink>
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
              {resourceSections.map(({ title, section, icon: Icon }) => (
                <SidebarMenuItem key={section}>
                  <SidebarMenuButton asChild isActive={isProjectSection(section)} tooltip={title}>
                    <ProjectSectionLink section={section}>
                      <Icon className="h-4 w-4" />
                      <span>{title}</span>
                    </ProjectSectionLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={currentPath === "/copilote"}
                  tooltip="Copilote IA"
                >
                  <Link to="/copilote" onClick={() => setOpenMobile(false)}>
                    <Sparkles className="h-4 w-4" />
                    <span>Copilote IA</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
