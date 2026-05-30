// Barrel de compatibilité — ne pas importer dans du nouveau code.
// Importer directement depuis les modules sources :
//   types      → @/lib/types
//   formatters → @/lib/utils/format
//   labels     → @/lib/mock/labels
//   données    → @/lib/mock/data
//   stats      → @/lib/mock/stats

export type {
  LotStatus,
  TaskStatus,
  Priority,
  ArtisanStatus,
  ProjectStatus,
  BudgetRiskLevel,
  Project,
  Lot,
  Task,
  Artisan,
  DocumentItem,
  Note,
  Alert,
} from "@/lib/types";

export { formatEUR, formatDate } from "@/lib/utils/format";

export {
  projectStatusLabel,
  lotStatusLabel,
  taskStatusLabel,
  priorityLabel,
  artisanStatusLabel,
  budgetRiskLevelLabel,
  documentCategoryLabel,
} from "@/lib/mock/labels";

export { projects, lots, tasks, artisans, documents, notes, alerts } from "@/lib/mock/data";

export { RESERVE, getProjectStats, getBudgetScenarioStats } from "@/lib/mock/stats";
