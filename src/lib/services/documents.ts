import type { DocumentItem } from "@/lib/types";
import { documents as mockDocuments } from "@/lib/mock/data";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/services/auth";
import type { Tables } from "@/lib/supabase/types";

export interface DocumentRow extends DocumentItem {
  storageBucket: string;
  storagePath: string;
  lotId: string | null;
}

function formatFileSize(bytes: number | null): string {
  if (bytes === null) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function toDocumentRow(row: Tables<"documents">): DocumentRow {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    size: formatFileSize(row.file_size_bytes),
    date: row.uploaded_at,
    uploadedBy: "Moi",
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    lotId: row.lot_id,
  };
}

// Backward compat — retourne DocumentItem (sans storageBucket/storagePath)
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

export async function getDocumentsByProjectOnly(projectId: string): Promise<DocumentRow[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("uploaded_at", { ascending: false });
  if (error || !data) return [];
  return data.map(toDocumentRow);
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

export async function uploadDocument(
  file: File,
  category: DocumentItem["category"],
  projectId: string,
  lotId?: string,
): Promise<DocumentRow> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");

  const documentId = crypto.randomUUID();
  const bucket = category === "photos" ? "project-photos" : "project-documents";
  const storagePath = `${user.id}/${projectId}/${documentId}/${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, { upsert: false });

  if (uploadError) {
    throw new Error(`Upload Storage échoué : ${uploadError.message}`);
  }

  const { data, error: dbError } = await supabase
    .from("documents")
    .insert({
      id: documentId,
      name: file.name,
      category,
      project_id: projectId,
      owner_id: user.id,
      storage_bucket: bucket,
      storage_path: storagePath,
      file_size_bytes: file.size,
      mime_type: file.type,
      lot_id: lotId || null,
    })
    .select()
    .single();

  if (dbError) {
    throw new Error(`Insertion DB échouée : ${dbError.message}`);
  }

  return toDocumentRow(data);
}

export async function getSignedUrl(bucket: string, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600);

  if (error) throw new Error(error.message);
  return data.signedUrl;
}

export async function deleteDocument(doc: DocumentRow): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from(doc.storageBucket)
    .remove([doc.storagePath]);

  if (storageError) {
    // Log mais on continue pour supprimer la row DB même si le fichier n'existe plus
    console.error("Erreur suppression Storage :", storageError.message);
  }

  const { error: dbError } = await supabase
    .from("documents")
    .delete()
    .eq("id", doc.id);

  if (dbError) throw new Error(`Suppression DB échouée : ${dbError.message}`);
}
