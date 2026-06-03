import type { Artisan } from "@/lib/types";
import { artisans as mockArtisans } from "@/lib/mock/data";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/services/auth";
import type { Tables } from "@/lib/supabase/types";

function toArtisan(row: Tables<"artisans">): Artisan {
  return {
    id: row.id,
    name: row.name,
    trade: row.trade,
    phone: row.phone,
    email: row.email,
    status: row.status,
    quote: null,
    notes: row.notes,
    trustRating: row.trust_rating,
  };
}

export async function getArtisans(): Promise<Artisan[]> {
  const { data, error } = await supabase.from("artisans").select("*").order("name");
  if (error || !data || data.length === 0) return mockArtisans;
  return data.map(toArtisan);
}

export async function getArtisansByProject(projectId: string): Promise<Artisan[]> {
  const { data, error } = await supabase
    .from("artisans")
    .select("*")
    .eq("project_id", projectId)
    .order("name");
  if (error || !data) return [];
  return data.map(toArtisan);
}

export async function createArtisan(input: {
  name: string;
  trade: string;
  phone?: string;
  email?: string;
  notes?: string;
  trust_rating?: number;
  project_id: string;
}): Promise<Artisan> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");
  const { data, error } = await supabase
    .from("artisans")
    .insert({
      name: input.name,
      trade: input.trade,
      phone: input.phone ?? "",
      email: input.email ?? "",
      notes: input.notes ?? "",
      trust_rating: input.trust_rating ?? 3,
      project_id: input.project_id,
      owner_id: user.id,
      status: "a_contacter",
    })
    .select()
    .single();
  if (error) throw error;
  return toArtisan(data);
}

export async function getArtisanById(artisanId: string): Promise<Artisan | undefined> {
  const { data, error } = await supabase
    .from("artisans")
    .select("*")
    .eq("id", artisanId)
    .maybeSingle();
  if (error || !data) return mockArtisans.find((a) => a.id === artisanId);
  return toArtisan(data);
}
