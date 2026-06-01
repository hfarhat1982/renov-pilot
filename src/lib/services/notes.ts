import type { Note } from "@/lib/types";
import { notes as mockNotes } from "@/lib/mock/data";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/services/auth";
import type { Tables } from "@/lib/supabase/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(id: string): boolean {
  return UUID_RE.test(id);
}

async function resolveProjectId(hint: string, userId: string): Promise<string> {
  if (isUuid(hint)) return hint;
  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .single();
  if (error || !data) throw new Error("Aucun projet Supabase trouvé pour cet utilisateur.");
  return data.id;
}

function toNote(row: Tables<"notes">): Note {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    date: row.note_date,
    author: row.author_name,
    type: row.note_type,
  };
}

export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("note_date", { ascending: false });
  if (error || !data || data.length === 0) return mockNotes;
  return data.map(toNote);
}

export async function createNote(input: {
  title: string;
  body: string;
  note_type: Note["type"];
  project_id: string;
}): Promise<Note> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");

  const project_id = await resolveProjectId(input.project_id, user.id);

  const { data, error } = await supabase
    .from("notes")
    .insert({
      title: input.title,
      body: input.body,
      note_type: input.note_type,
      project_id,
      owner_id: user.id,
      note_date: new Date().toISOString().split("T")[0],
      author_name: "Moi",
    })
    .select()
    .single();

  if (error) throw error;
  return toNote(data);
}

// Note n'a pas de champ projectId côté frontend — filtre en base, retourne tout si vide.
export async function getNotesByProject(projectId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("project_id", projectId)
    .order("note_date", { ascending: false });
  if (error || !data || data.length === 0) return mockNotes;
  return data.map(toNote);
}
