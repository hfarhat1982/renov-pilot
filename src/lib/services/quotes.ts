import type { Quote } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

function toQuote(row: Tables<"quotes">): Quote {
  return {
    id: row.id,
    projectId: row.project_id,
    lotId: row.lot_id,
    artisanId: row.artisan_id,
    artisanName: row.artisan_name,
    amount: row.amount_cents / 100,
    quoteDate: row.quote_date,
    isRetained: row.is_retained,
    storagePath: row.storage_path,
    comment: row.comment,
  };
}

export async function getQuotes(): Promise<Quote[]> {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("quote_date", { ascending: false });
  if (error || !data) return [];
  return data.map(toQuote);
}

export async function getQuotesByProject(projectId: string): Promise<Quote[]> {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("project_id", projectId)
    .order("quote_date", { ascending: false });
  if (error || !data) return [];
  return data.map(toQuote);
}

export async function getQuotesByLot(lotId: string): Promise<Quote[]> {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("lot_id", lotId)
    .order("quote_date", { ascending: false });
  if (error || !data) return [];
  return data.map(toQuote);
}

export async function getRetainedQuoteByLot(lotId: string): Promise<Quote | null> {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("lot_id", lotId)
    .eq("is_retained", true)
    .maybeSingle();
  if (error || !data) return null;
  return toQuote(data);
}
