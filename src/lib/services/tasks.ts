import type { Task } from "@/lib/types";
import { tasks as mockTasks } from "@/lib/mock/data";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

function toTask(row: Tables<"tasks">): Task {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    lotId: row.lot_id,
    owner: row.assignee_name,
    priority: row.priority,
    status: row.status,
    dueDate: row.due_date ?? "",
    notes: row.notes,
  };
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error || !data || data.length === 0) return mockTasks;
  return data.map(toTask);
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error || !data || data.length === 0)
    return mockTasks.filter((t) => t.projectId === projectId);
  return data.map(toTask);
}

export async function getTasksByLot(lotId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("lot_id", lotId)
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error || !data || data.length === 0) return mockTasks.filter((t) => t.lotId === lotId);
  return data.map(toTask);
}
