import type {
  LotStatus,
  TaskStatus,
  Priority,
  ArtisanStatus,
  ProjectStatus,
  BudgetRiskLevel,
  DocumentItem,
} from "@/lib/types";

export const projectStatusLabel: Record<ProjectStatus, string> = {
  etude: "Étude technique",
  travaux: "Travaux en cours",
  termine: "Terminé",
  suspendu: "Suspendu",
};

export const lotStatusLabel: Record<LotStatus, string> = {
  a_etudier: "À étudier",
  devis_demande: "Devis demandé",
  devis_recu: "Devis reçu",
  valide: "Validé",
  en_cours: "En cours",
  termine: "Terminé",
  bloque: "Bloqué",
};

export const taskStatusLabel: Record<TaskStatus, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  termine: "Terminé",
  bloque: "Bloqué",
};

export const priorityLabel: Record<Priority, string> = {
  basse: "Basse",
  moyenne: "Moyenne",
  haute: "Haute",
  critique: "Critique",
};

export const artisanStatusLabel: Record<ArtisanStatus, string> = {
  a_contacter: "À contacter",
  contacte: "Contacté",
  devis_recu: "Devis reçu",
  retenu: "Retenu",
  ecarte: "Écarté",
};

export const budgetRiskLevelLabel: Record<BudgetRiskLevel, string> = {
  faible: "Faible",
  moyen: "Moyen",
  eleve: "Élevé",
  critique: "Critique",
};

export const documentCategoryLabel: Record<DocumentItem["category"], string> = {
  plans: "Plans",
  devis: "Devis",
  factures: "Factures",
  photos: "Photos chantier",
  declaration: "Déclaration préalable",
  etude_sol: "Étude de sol",
  notices: "Notices produits",
  garanties: "Garanties",
};
