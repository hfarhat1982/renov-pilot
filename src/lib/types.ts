export type LotStatus =
  | "a_etudier"
  | "devis_demande"
  | "devis_recu"
  | "valide"
  | "en_cours"
  | "termine"
  | "bloque";

export type TaskStatus = "a_faire" | "en_cours" | "termine" | "bloque";
export type Priority = "basse" | "moyenne" | "haute" | "critique";
export type ArtisanStatus = "a_contacter" | "contacte" | "devis_recu" | "retenu" | "ecarte";
export type ProjectStatus = "etude" | "travaux" | "termine" | "suspendu";

export interface Project {
  id: string;
  name: string;
  type: string;
  surface: number;
  status: ProjectStatus;
  budgetTarget: number;
  priorities: string[];
  startDate: string;
  progress: number;
}

export interface Lot {
  id: string;
  projectId: string;
  name: string;
  status: LotStatus;
  budgetPlanned: number;
  quoteReceived: number | null;
  realCost: number | null;
  artisanId: string | null;
  priority: Priority;
  notes: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  lotId: string | null;
  owner: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
  notes: string;
}

export interface Artisan {
  id: string;
  name: string;
  trade: string;
  phone: string;
  email: string;
  status: ArtisanStatus;
  quote: number | null;
  notes: string;
  trustRating: number;
}

export interface DocumentItem {
  id: string;
  name: string;
  category:
    | "plans"
    | "devis"
    | "factures"
    | "photos"
    | "declaration"
    | "etude_sol"
    | "notices"
    | "garanties";
  size: string;
  date: string;
  uploadedBy: string;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  date: string;
  author: string;
  type: "decision" | "note" | "alerte";
}

export interface Alert {
  id: string;
  title: string;
  level: "info" | "warning" | "critical";
  date: string;
}
