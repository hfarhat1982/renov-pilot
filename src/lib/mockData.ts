// Mock data for RenoV Pilot MVP.
// Centralized so it's trivial to swap with Supabase queries later.

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

export interface Project {
  id: string;
  name: string;
  type: string;
  surface: number;
  status: string;
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

export const projects: Project[] = [
  {
    id: "p1",
    name: "Aménagement sous-sol habitable",
    type: "Rénovation intérieure",
    surface: 35,
    status: "Étude technique",
    budgetTarget: 30000,
    priorities: [
      "Éviter les problèmes d'humidité",
      "Valider la faisabilité structurelle",
      "Gérer les évacuations avec station de relevage",
      "Préparer un dossier propre pour la déclaration préalable",
      "Suivre précisément le budget",
    ],
    startDate: "2026-03-15",
    progress: 18,
  },
];

export const artisans: Artisan[] = [
  {
    id: "a1",
    name: "BTP Solutions Sol",
    trade: "Étude de sol",
    phone: "06 12 34 56 78",
    email: "contact@btp-sol.fr",
    status: "devis_recu",
    quote: 1450,
    notes: "Disponible sous 2 semaines. Rapport G2 inclus.",
    trustRating: 4,
  },
  {
    id: "a2",
    name: "Maçonnerie Dupuis & Fils",
    trade: "Maçonnerie",
    phone: "06 22 11 33 44",
    email: "contact@dupuis-maconnerie.fr",
    status: "devis_recu",
    quote: 8400,
    notes: "Bonnes références sur sous-sols semi-enterrés.",
    trustRating: 5,
  },
  {
    id: "a3",
    name: "AquaPlomb",
    trade: "Plomberie",
    phone: "07 88 99 11 22",
    email: "devis@aquaplomb.fr",
    status: "contacte",
    quote: null,
    notes: "Visite prévue jeudi prochain.",
    trustRating: 4,
  },
  {
    id: "a4",
    name: "ElecPro 92",
    trade: "Électricité",
    phone: "06 55 44 33 22",
    email: "info@elecpro92.fr",
    status: "a_contacter",
    quote: null,
    notes: "",
    trustRating: 0,
  },
  {
    id: "a5",
    name: "Isolation Confort",
    trade: "Isolation",
    phone: "06 77 88 99 00",
    email: "contact@isolation-confort.fr",
    status: "devis_recu",
    quote: 3950,
    notes: "Préconise polyuréthane projeté pour murs enterrés.",
    trustRating: 4,
  },
];

export const lots: Lot[] = [
  {
    id: "l1",
    projectId: "p1",
    name: "Étude de sol",
    status: "valide",
    budgetPlanned: 1500,
    quoteReceived: 1450,
    realCost: 1450,
    artisanId: "a1",
    priority: "critique",
    notes: "Réalisée en mars. Aucun risque structurel majeur.",
  },
  {
    id: "l2",
    projectId: "p1",
    name: "Déclaration préalable / mairie",
    status: "en_cours",
    budgetPlanned: 0,
    quoteReceived: null,
    realCost: null,
    artisanId: null,
    priority: "haute",
    notes: "Dossier en cours de constitution.",
  },
  {
    id: "l3",
    projectId: "p1",
    name: "Décaissement / maçonnerie",
    status: "devis_recu",
    budgetPlanned: 8000,
    quoteReceived: 8400,
    realCost: null,
    artisanId: "a2",
    priority: "critique",
    notes: "Léger dépassement à arbitrer.",
  },
  {
    id: "l4",
    projectId: "p1",
    name: "Structure / renforcement",
    status: "a_etudier",
    budgetPlanned: 0,
    quoteReceived: null,
    realCost: null,
    artisanId: null,
    priority: "haute",
    notes: "À chiffrer après validation de l'étude de sol.",
  },
  {
    id: "l5",
    projectId: "p1",
    name: "Traitement humidité",
    status: "a_etudier",
    budgetPlanned: 0,
    quoteReceived: null,
    realCost: null,
    artisanId: null,
    priority: "critique",
    notes: "Cuvelage à étudier.",
  },
  {
    id: "l6",
    projectId: "p1",
    name: "Isolation murs et sol",
    status: "devis_recu",
    budgetPlanned: 4000,
    quoteReceived: 3950,
    realCost: null,
    artisanId: "a5",
    priority: "haute",
    notes: "",
  },
  {
    id: "l7",
    projectId: "p1",
    name: "Plomberie",
    status: "devis_demande",
    budgetPlanned: 3500,
    quoteReceived: null,
    realCost: null,
    artisanId: "a3",
    priority: "haute",
    notes: "",
  },
  {
    id: "l8",
    projectId: "p1",
    name: "Station de relevage eaux usées",
    status: "a_etudier",
    budgetPlanned: 1500,
    quoteReceived: null,
    realCost: null,
    artisanId: null,
    priority: "critique",
    notes: "À coupler avec lot plomberie.",
  },
  {
    id: "l9",
    projectId: "p1",
    name: "Électricité",
    status: "a_etudier",
    budgetPlanned: 3000,
    quoteReceived: null,
    realCost: null,
    artisanId: "a4",
    priority: "haute",
    notes: "",
  },
  {
    id: "l10",
    projectId: "p1",
    name: "Ventilation / VMC",
    status: "a_etudier",
    budgetPlanned: 1500,
    quoteReceived: null,
    realCost: null,
    artisanId: null,
    priority: "haute",
    notes: "VMC double flux à envisager.",
  },
  {
    id: "l11",
    projectId: "p1",
    name: "Cloisons",
    status: "a_etudier",
    budgetPlanned: 1500,
    quoteReceived: null,
    realCost: null,
    artisanId: null,
    priority: "moyenne",
    notes: "",
  },
  {
    id: "l12",
    projectId: "p1",
    name: "Sol",
    status: "a_etudier",
    budgetPlanned: 1500,
    quoteReceived: null,
    realCost: null,
    artisanId: null,
    priority: "moyenne",
    notes: "",
  },
  {
    id: "l13",
    projectId: "p1",
    name: "Peinture",
    status: "a_etudier",
    budgetPlanned: 1000,
    quoteReceived: null,
    realCost: null,
    artisanId: null,
    priority: "basse",
    notes: "",
  },
  {
    id: "l14",
    projectId: "p1",
    name: "Menuiserie",
    status: "a_etudier",
    budgetPlanned: 700,
    quoteReceived: null,
    realCost: null,
    artisanId: null,
    priority: "basse",
    notes: "",
  },
  {
    id: "l15",
    projectId: "p1",
    name: "Finitions / déco",
    status: "a_etudier",
    budgetPlanned: 1000,
    quoteReceived: null,
    realCost: null,
    artisanId: null,
    priority: "basse",
    notes: "",
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    projectId: "p1",
    title: "Récupérer le rapport d'étude de sol G2",
    lotId: "l1",
    owner: "Moi",
    priority: "haute",
    status: "termine",
    dueDate: "2026-04-02",
    notes: "",
  },
  {
    id: "t2",
    projectId: "p1",
    title: "Déposer la déclaration préalable en mairie",
    lotId: "l2",
    owner: "Moi",
    priority: "critique",
    status: "en_cours",
    dueDate: "2026-06-10",
    notes: "Plans à finaliser.",
  },
  {
    id: "t3",
    projectId: "p1",
    title: "Comparer les devis maçonnerie",
    lotId: "l3",
    owner: "Moi",
    priority: "haute",
    status: "en_cours",
    dueDate: "2026-06-05",
    notes: "2 devis reçus, 1 en attente.",
  },
  {
    id: "t4",
    projectId: "p1",
    title: "Visite plombier AquaPlomb",
    lotId: "l7",
    owner: "Moi",
    priority: "haute",
    status: "a_faire",
    dueDate: "2026-06-12",
    notes: "",
  },
  {
    id: "t5",
    projectId: "p1",
    title: "Demander 3 devis traitement humidité",
    lotId: "l5",
    owner: "Moi",
    priority: "critique",
    status: "a_faire",
    dueDate: "2026-06-15",
    notes: "Cuvelage vs drainage périphérique.",
  },
  {
    id: "t6",
    projectId: "p1",
    title: "Valider type de VMC",
    lotId: "l10",
    owner: "Moi",
    priority: "moyenne",
    status: "a_faire",
    dueDate: "2026-06-25",
    notes: "",
  },
  {
    id: "t7",
    projectId: "p1",
    title: "Préparer plans cotés pour mairie",
    lotId: "l2",
    owner: "Moi",
    priority: "haute",
    status: "en_cours",
    dueDate: "2026-06-08",
    notes: "",
  },
];

export const documents: DocumentItem[] = [
  {
    id: "d1",
    name: "Plan sous-sol existant.pdf",
    category: "plans",
    size: "1,2 Mo",
    date: "2026-03-20",
    uploadedBy: "Moi",
  },
  {
    id: "d2",
    name: "Plan projet aménagement v2.pdf",
    category: "plans",
    size: "1,8 Mo",
    date: "2026-05-15",
    uploadedBy: "Moi",
  },
  {
    id: "d3",
    name: "Devis Dupuis maçonnerie.pdf",
    category: "devis",
    size: "420 Ko",
    date: "2026-05-22",
    uploadedBy: "Moi",
  },
  {
    id: "d4",
    name: "Devis Isolation Confort.pdf",
    category: "devis",
    size: "380 Ko",
    date: "2026-05-24",
    uploadedBy: "Moi",
  },
  {
    id: "d5",
    name: "Rapport étude de sol G2.pdf",
    category: "etude_sol",
    size: "3,4 Mo",
    date: "2026-04-02",
    uploadedBy: "BTP Solutions Sol",
  },
  {
    id: "d6",
    name: "Photo état initial mur nord.jpg",
    category: "photos",
    size: "2,1 Mo",
    date: "2026-03-15",
    uploadedBy: "Moi",
  },
  {
    id: "d7",
    name: "Photo trace humidité angle SE.jpg",
    category: "photos",
    size: "1,9 Mo",
    date: "2026-03-15",
    uploadedBy: "Moi",
  },
  {
    id: "d8",
    name: "Notice station de relevage SFA.pdf",
    category: "notices",
    size: "780 Ko",
    date: "2026-05-10",
    uploadedBy: "Moi",
  },
  {
    id: "d9",
    name: "Brouillon CERFA DP.pdf",
    category: "declaration",
    size: "210 Ko",
    date: "2026-05-28",
    uploadedBy: "Moi",
  },
];

export const notes: Note[] = [
  {
    id: "n1",
    type: "decision",
    title: "Choix du système d'évacuation",
    body: "Station de relevage SFA Sanibroyeur PRO retenue : compatible WC + douche, bruit acceptable, SAV reconnu.",
    date: "2026-05-12",
    author: "Moi",
  },
  {
    id: "n2",
    type: "decision",
    title: "Type d'isolation murs enterrés",
    body: "Polyuréthane projeté préféré aux panneaux rigides : meilleure adhérence sur supports irréguliers, pas de pont thermique.",
    date: "2026-05-18",
    author: "Moi",
  },
  {
    id: "n3",
    type: "alerte",
    title: "Trace d'humidité angle sud-est",
    body: "Auréole repérée après les pluies de mars. À investiguer avant tout doublage. Photo dans le dossier chantier.",
    date: "2026-03-16",
    author: "Moi",
  },
  {
    id: "n4",
    type: "note",
    title: "Hauteur sous plafond limite",
    body: "2,28 m après dalle isolée — vérifier la conformité pour un espace habitable (mini 2,20 m après finitions).",
    date: "2026-04-04",
    author: "Moi",
  },
  {
    id: "n5",
    type: "alerte",
    title: "Devis maçonnerie au-dessus du budget",
    body: "Devis Dupuis à 8 400 € pour 8 000 € prévus. Négocier ou ajuster la marge imprévus.",
    date: "2026-05-23",
    author: "Moi",
  },
];

export const alerts: Alert[] = [
  {
    id: "al1",
    title: "Trace d'humidité non traitée — angle sud-est",
    level: "critical",
    date: "2026-03-16",
  },
  {
    id: "al2",
    title: "Devis maçonnerie dépasse de 400 € le budget prévu",
    level: "warning",
    date: "2026-05-23",
  },
  {
    id: "al3",
    title: "Déclaration préalable à déposer avant le 10 juin",
    level: "warning",
    date: "2026-06-01",
  },
  { id: "al4", title: "3 lots critiques encore sans devis", level: "info", date: "2026-05-29" },
];

export function formatEUR(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getProjectStats(projectId: string) {
  const projectLots = lots.filter((l) => l.projectId === projectId);
  const budgetPlanned = projectLots.reduce((s, l) => s + l.budgetPlanned, 0);
  const budgetReserve = 3000;
  const engaged = projectLots.reduce((s, l) => s + (l.realCost ?? l.quoteReceived ?? 0), 0);
  const project = projects.find((p) => p.id === projectId);
  const target = project?.budgetTarget ?? 0;
  const remaining = target - engaged;
  const lotsWithProgress = projectLots.filter((l) => l.status === "termine").length;
  const progress = projectLots.length
    ? Math.round((lotsWithProgress / projectLots.length) * 100)
    : 0;
  return {
    budgetPlanned: budgetPlanned + budgetReserve,
    engaged,
    remaining,
    target,
    progress,
    lotsTotal: projectLots.length,
    lotsDone: lotsWithProgress,
  };
}
