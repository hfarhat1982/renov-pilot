import type { Quote } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/services/auth";
import type { Tables, TablesUpdate } from "@/lib/supabase/types";

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

export async function createQuote(input: {
  projectId: string;
  lotId: string;
  artisanId?: string | null;
  artisanName?: string;
  amountEur: number;
  quoteDate?: string | null;
  isRetained?: boolean;
  comment?: string;
}): Promise<Quote> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");
  const { data, error } = await supabase
    .from("quotes")
    .insert({
      project_id: input.projectId,
      lot_id: input.lotId,
      owner_id: user.id,
      artisan_id: input.artisanId ?? null,
      artisan_name: input.artisanName ?? "",
      amount_cents: Math.round(input.amountEur * 100),
      quote_date: input.quoteDate ?? null,
      is_retained: input.isRetained ?? false,
      comment: input.comment ?? "",
    })
    .select()
    .single();
  if (error) throw error;
  return toQuote(data);
}

export async function updateQuote(
  id: string,
  input: {
    lotId?: string;
    artisanId?: string | null;
    artisanName?: string;
    amountEur?: number;
    quoteDate?: string | null;
    isRetained?: boolean;
    comment?: string;
  },
): Promise<Quote> {
  const patch: TablesUpdate<"quotes"> = {};
  if (input.lotId !== undefined) patch.lot_id = input.lotId;
  if (input.artisanId !== undefined) patch.artisan_id = input.artisanId;
  if (input.artisanName !== undefined) patch.artisan_name = input.artisanName;
  if (input.amountEur !== undefined) patch.amount_cents = Math.round(input.amountEur * 100);
  if (input.quoteDate !== undefined) patch.quote_date = input.quoteDate;
  if (input.isRetained !== undefined) patch.is_retained = input.isRetained;
  if (input.comment !== undefined) patch.comment = input.comment;

  const { data, error } = await supabase
    .from("quotes")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toQuote(data);
}

export async function deleteQuote(id: string): Promise<void> {
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) throw error;
}

export async function setRetainedQuote(lotId: string, quoteId: string): Promise<void> {
  const { error: clearError } = await supabase
    .from("quotes")
    .update({ is_retained: false })
    .eq("lot_id", lotId)
    .neq("id", quoteId);
  if (clearError) throw clearError;

  const { error: setError } = await supabase
    .from("quotes")
    .update({ is_retained: true })
    .eq("id", quoteId);
  if (setError) throw setError;
}
