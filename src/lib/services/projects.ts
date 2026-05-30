import type { Project } from "@/lib/types";
import { projects } from "@/lib/mock/data";
import { getProjectStats as computeProjectStats } from "@/lib/mock/stats";

export async function getProjects(): Promise<Project[]> {
  return projects;
}

export async function getProjectById(projectId: string): Promise<Project | undefined> {
  return projects.find((p) => p.id === projectId);
}

// TODO: replace with user session / active project selection once auth is in place.
export async function getActiveProject(): Promise<Project> {
  return projects[0];
}

export async function getProjectStats(projectId: string) {
  return computeProjectStats(projectId);
}
