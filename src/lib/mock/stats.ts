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
