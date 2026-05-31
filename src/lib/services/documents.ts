import type { DocumentItem } from "@/lib/types";
import { documents as mockDocuments } from "@/lib/mock/data";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function toDocument(row: Tables<"documents">): DocumentItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    size: formatFileSize(row.file_size_bytes),
    date: row.uploaded_at,
    uploadedBy: "Moi",
  };
}

export async function getDocuments(): Promise<DocumentItem[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .order("uploaded_at", { ascending: false });
  if (error || !data || data.length === 0) return mockDocuments;
  return data.map(toDocument);
}

export async function getDocumentsByCategory(
  category: DocumentItem["category"],
): Promise<DocumentItem[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("category", category)
    .order("uploaded_at", { ascending: false });
  if (error || !data || data.length === 0)
    return mockDocuments.filter((d) => d.category === category);
  return data.map(toDocument);
}

// DocumentItem n'a pas de champ projectId côté frontend — filtre en base, retourne tout si vide.
export async function getDocumentsByProject(projectId: string): Promise<DocumentItem[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("uploaded_at", { ascending: false });
  if (error || !data || data.length === 0) return mockDocuments;
  return data.map(toDocument);
}
