import type { Task } from "@/lib/types";
import { tasks } from "@/lib/mock/data";

export async function getTasks(): Promise<Task[]> {
  return tasks;
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  return tasks.filter((t) => t.projectId === projectId);
}

export async function getTasksByLot(lotId: string): Promise<Task[]> {
  return tasks.filter((t) => t.lotId === lotId);
}
