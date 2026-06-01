import type { Project } from "@/lib/types";
import { projects as mockProjects } from "@/lib/mock/data";
import { getProjectStats as computeProjectStats } from "@/lib/mock/stats";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/services/auth";
import { getStoredProjectId, isUuid, storeProjectId } from "@/lib/activeProject";
import type { Tables } from "@/lib/supabase/types";

function toProject(row: Tables<"projects">): Project {
  return {
    id: row.id,
    name: row.name,
    type: row.project_type,
    surface: row.surface_m2 ?? 0,
    status: row.status,
    budgetTarget: row.budget_target_cents / 100,
    priorities: row.priorities,
    startDate: row.start_date ?? "",
    progress: 0,
  };
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from("projects").select("*");
  if (error || !data || data.length === 0) return mockProjects;
  return data.map(toProject);
}

export async function getProjectById(projectId: string): Promise<Project | undefined> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();
  if (error || !data) return mockProjects.find((p) => p.id === projectId);
  return toProject(data);
}

// TODO: replace with user session / active project selection once auth is in place.
export async function getActiveProject(): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !data) return mockProjects[0];
  return toProject(data);
}

export async function getProjectStats(projectId: string) {
  return computeProjectStats(projectId);
}

export async function resolveActiveProject(): Promise<Project | null> {
  const storedId = getStoredProjectId();
  if (storedId) {
    const project = await getProjectById(storedId);
    if (project && isUuid(project.id)) return project;
  }
  const projects = await getSupabaseProjectsOnly();
  if (projects.length === 0) return null;
  storeProjectId(projects[0].id);
  return projects[0];
}

export async function getSupabaseProjectsOnly(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: true });
  if (error || !data || data.length === 0) return [];
  return data.map(toProject);
}

export async function createProject(input: {
  name: string;
  project_type: string;
  surface_m2: number;
  budget_target: number;
  start_date: string;
}): Promise<Project> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      project_type: input.project_type,
      surface_m2: input.surface_m2 || null,
      budget_target_cents: Math.round(input.budget_target * 100),
      start_date: input.start_date || null,
      status: "etude",
      owner_id: user.id,
      priorities: [],
    })
    .select()
    .single();

  if (error) throw error;
  return toProject(data);
}
