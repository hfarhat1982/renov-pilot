import type { Decision, DecisionStatus, Priority } from "@/lib/types";
import { decisions as mockDecisions } from "@/lib/mock/data";
import { supabase } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/services/auth";
import type { Tables, TablesUpdate } from "@/lib/supabase/types";

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

export async function createDecision(input: {
  projectId: string;
  title: string;
  context?: string;
  options?: string[];
  selectedOption?: string | null;
  status?: DecisionStatus;
  priority?: Priority;
  budgetImpact?: number | null;
  planningImpactDays?: number | null;
  decisionDate?: string | null;
  notes?: string;
}): Promise<Decision> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Non authentifié");
  const { data, error } = await supabase
    .from("decisions")
    .insert({
      project_id: input.projectId,
      owner_id: user.id,
      title: input.title,
      context: input.context ?? "",
      options: input.options ?? [],
      selected_option: input.selectedOption ?? null,
      status: input.status ?? "a_trancher",
      priority: input.priority ?? "moyenne",
      budget_impact_cents: input.budgetImpact != null ? Math.round(input.budgetImpact * 100) : null,
      planning_impact_days: input.planningImpactDays ?? null,
      decision_date: input.decisionDate ?? null,
      notes: input.notes ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return toDecision(data);
}

export async function updateDecision(
  id: string,
  input: {
    title?: string;
    context?: string;
    options?: string[];
    selectedOption?: string | null;
    status?: DecisionStatus;
    priority?: Priority;
    budgetImpact?: number | null;
    planningImpactDays?: number | null;
    decisionDate?: string | null;
    notes?: string;
  },
): Promise<Decision> {
  const patch: TablesUpdate<"decisions"> = {};
  if (input.title !== undefined) patch.title = input.title;
  if (input.context !== undefined) patch.context = input.context;
  if (input.options !== undefined) patch.options = input.options;
  if (input.selectedOption !== undefined) patch.selected_option = input.selectedOption;
  if (input.status !== undefined) patch.status = input.status;
  if (input.priority !== undefined) patch.priority = input.priority;
  if (input.budgetImpact !== undefined) {
    patch.budget_impact_cents = input.budgetImpact != null ? Math.round(input.budgetImpact * 100) : null;
  }
  if (input.planningImpactDays !== undefined) patch.planning_impact_days = input.planningImpactDays;
  if (input.decisionDate !== undefined) patch.decision_date = input.decisionDate;
  if (input.notes !== undefined) patch.notes = input.notes;

  const { data, error } = await supabase
    .from("decisions")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return toDecision(data);
}

export async function deleteDecision(id: string): Promise<void> {
  const { error } = await supabase.from("decisions").delete().eq("id", id);
  if (error) throw error;
}
