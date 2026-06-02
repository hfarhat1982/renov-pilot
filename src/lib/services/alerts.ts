import type { Alert } from "@/lib/types";
import { alerts as mockAlerts } from "@/lib/mock/data";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

function toAlert(row: Tables<"alerts">): Alert {
  return {
    id: row.id,
    title: row.title,
    level: row.level,
    date: row.alert_date,
  };
}

export async function getAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("is_resolved", false)
    .order("alert_date", { ascending: false });
  if (error || !data || data.length === 0) return mockAlerts;
  return data.map(toAlert);
}

export async function getAlertsByProjectOnly(projectId: string): Promise<Alert[]> {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_resolved", false)
    .order("alert_date", { ascending: false });
  if (error || !data) return [];
  return data.map(toAlert);
}

// Alert n'a pas de champ projectId côté frontend — filtre en base, retourne tout si vide.
export async function getAlertsByProject(projectId: string): Promise<Alert[]> {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_resolved", false)
    .order("alert_date", { ascending: false });
  if (error || !data || data.length === 0) return mockAlerts;
  return data.map(toAlert);
}
