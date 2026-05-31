import type { Decision } from "@/lib/types";
import { decisions as mockDecisions } from "@/lib/mock/data";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

function toDecision(row: Tables<"decisions">): Decision {
  return {
    id: row.id,
    projectId: row.project_id,
    title: row.title,
    context: row.context,
    options: row.options,
    selectedOption: row.selected_option,
    status: row.status,
    budgetImpact: row.budget_impact_cents !== null ? row.budget_impact_cents / 100 : null,
    planningImpactDays: row.planning_impact_days,
    linkedDocuments: [],
    decisionDate: row.decision_date,
    priority: row.priority,
    notes: row.notes ?? undefined,
  };
}

export async function getDecisions(): Promise<Decision[]> {
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return mockDecisions;
  return data.map(toDecision);
}

export async function getDecisionsByProject(projectId: string): Promise<Decision[]> {
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0)
    return mockDecisions.filter((d) => d.projectId === projectId);
  return data.map(toDecision);
}

export async function getDecisionById(decisionId: string): Promise<Decision | undefined> {
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .eq("id", decisionId)
    .maybeSingle();
  if (error || !data) return mockDecisions.find((d) => d.id === decisionId);
  return toDecision(data);
}
