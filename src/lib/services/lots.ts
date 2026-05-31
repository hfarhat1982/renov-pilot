import type { Lot } from "@/lib/types";
import { lots as mockLots } from "@/lib/mock/data";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

function toLot(row: Tables<"lots">): Lot {
  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    status: row.status,
    budgetPlanned: row.budget_planned_cents / 100,
    quoteReceived: null,
    realCost: row.real_cost_cents !== null ? row.real_cost_cents / 100 : null,
    artisanId: row.artisan_id,
    priority: row.priority,
    notes: row.notes,
    budgetOptimistic:
      row.budget_optimistic_cents !== null ? row.budget_optimistic_cents / 100 : null,
    budgetRetained: row.budget_retained_cents !== null ? row.budget_retained_cents / 100 : null,
    budgetPessimistic:
      row.budget_pessimistic_cents !== null ? row.budget_pessimistic_cents / 100 : null,
    budgetRiskLevel: row.budget_risk_level,
    budgetComment: row.budget_comment ?? undefined,
  };
}

export async function getLots(): Promise<Lot[]> {
  const { data, error } = await supabase.from("lots").select("*").order("sort_order");
  if (error || !data || data.length === 0) return mockLots;
  return data.map(toLot);
}

export async function getLotsByProject(projectId: string): Promise<Lot[]> {
  const { data, error } = await supabase
    .from("lots")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order");
  if (error || !data || data.length === 0) return mockLots.filter((l) => l.projectId === projectId);
  return data.map(toLot);
}

export async function getLotById(lotId: string): Promise<Lot | undefined> {
  const { data, error } = await supabase.from("lots").select("*").eq("id", lotId).maybeSingle();
  if (error || !data) return mockLots.find((l) => l.id === lotId);
  return toLot(data);
}
