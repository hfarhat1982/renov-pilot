import type { Note } from "@/lib/types";
import { notes as mockNotes } from "@/lib/mock/data";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

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
