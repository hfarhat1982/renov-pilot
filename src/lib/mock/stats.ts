import type { Lot } from "@/lib/types";
import { lots, projects } from "./data";

export const RESERVE = 3000;

export function getProjectStats(projectId: string) {
  const projectLots = lots.filter((l) => l.projectId === projectId);
  const budgetPlanned = projectLots.reduce((s, l) => s + l.budgetPlanned, 0);
  const engaged = projectLots.reduce((s, l) => s + (l.realCost ?? l.quoteReceived ?? 0), 0);
  const project = projects.find((p) => p.id === projectId);
  const target = project?.budgetTarget ?? 0;
  const remaining = target - engaged;
  const lotsWithProgress = projectLots.filter((l) => l.status === "termine").length;
  const progress = projectLots.length
    ? Math.round((lotsWithProgress / projectLots.length) * 100)
    : 0;
  return {
    budgetPlanned: budgetPlanned + RESERVE,
    engaged,
    remaining,
    target,
    progress,
    lotsTotal: projectLots.length,
    lotsDone: lotsWithProgress,
  };
}

export function getBudgetScenarioStats(
  lots: Lot[],
  reserve = RESERVE,
  target = 0,
): {
  optimisticTotal: number;
  retainedTotal: number;
  pessimisticTotal: number;
  retainedWithReserve: number;
  pessimisticWithReserve: number;
  targetGapRetained: number;
  targetGapPessimistic: number;
} {
  const optimisticTotal = lots.reduce((s, l) => s + (l.budgetOptimistic ?? l.budgetPlanned), 0);
  const retainedTotal = lots.reduce((s, l) => s + (l.budgetRetained ?? l.budgetPlanned), 0);
  const pessimisticTotal = lots.reduce((s, l) => s + (l.budgetPessimistic ?? l.budgetPlanned), 0);
  const retainedWithReserve = retainedTotal + reserve;
  const pessimisticWithReserve = pessimisticTotal + reserve;
  return {
    optimisticTotal,
    retainedTotal,
    pessimisticTotal,
    retainedWithReserve,
    pessimisticWithReserve,
    targetGapRetained: target - retainedWithReserve,
    targetGapPessimistic: target - pessimisticWithReserve,
  };
}
