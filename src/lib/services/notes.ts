import type { Note } from "@/lib/types";
import { notes } from "@/lib/mock/data";

export async function getNotes(): Promise<Note[]> {
  return notes;
}

// TODO: Note n'a pas encore de champ projectId — retourne toutes les notes.
// Ajouter projectId à Note et filtrer ici une fois le schéma mis à jour.
export async function getNotesByProject(_projectId: string): Promise<Note[]> {
  return notes;
}
