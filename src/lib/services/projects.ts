import type { Project } from "@/lib/types";
import { projects as mockProjects } from "@/lib/mock/data";
import { getProjectStats as computeProjectStats } from "@/lib/mock/stats";
import { supabase } from "@/lib/supabase/client";
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
