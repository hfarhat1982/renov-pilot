import type { DocumentItem } from "@/lib/types";
import { documents } from "@/lib/mock/data";

export async function getDocuments(): Promise<DocumentItem[]> {
  return documents;
}

export async function getDocumentsByCategory(
  category: DocumentItem["category"],
): Promise<DocumentItem[]> {
  return documents.filter((d) => d.category === category);
}

// TODO: DocumentItem n'a pas encore de champ projectId — retourne tous les documents.
// Ajouter projectId à DocumentItem et filtrer ici une fois le schéma mis à jour.
export async function getDocumentsByProject(_projectId: string): Promise<DocumentItem[]> {
  return documents;
}
