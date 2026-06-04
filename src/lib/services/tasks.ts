import type { Task, Priority, TaskStatus } from "@/lib/types";
import { tasks as mockTasks } from "@/lib/mock/data";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/services/auth";
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

export async function createTask(input: {
  title: string;
  project_id: string;
  lot_id?: string | null;
  assignee_name?: string;
  priority?: Priority;
  status?: TaskStatus;
  due_date?: string | null;
  notes?: string;
}): Promise<Task> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: input.title,
      project_id: input.project_id,
      owner_id: user.id,
      lot_id: input.lot_id ?? null,
      assignee_name: input.assignee_name ?? "",
      priority: input.priority ?? "moyenne",
      status: input.status ?? "a_faire",
      due_date: input.due_date ?? null,
      notes: input.notes ?? "",
    })
    .select()
    .single();
  if (error) throw error;
  return toTask(data);
}

export async function updateTask(
  id: string,
  input: {
    title?: string;
    lot_id?: string | null;
    assignee_name?: string;
    priority?: Priority;
    status?: TaskStatus;
    due_date?: string | null;
    notes?: string;
  }
): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.lot_id !== undefined && { lot_id: input.lot_id }),
      ...(input.assignee_name !== undefined && { assignee_name: input.assignee_name }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.due_date !== undefined && { due_date: input.due_date }),
      ...(input.notes !== undefined && { notes: input.notes }),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toTask(data);
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
