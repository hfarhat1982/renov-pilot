import type { Decision } from "@/lib/types";
import { decisions } from "@/lib/mock/data";

export async function getDecisions(): Promise<Decision[]> {
  return decisions;
}

export async function getDecisionsByProject(projectId: string): Promise<Decision[]> {
  return decisions.filter((d) => d.projectId === projectId);
}

export async function getDecisionById(decisionId: string): Promise<Decision | undefined> {
  return decisions.find((d) => d.id === decisionId);
}
