import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  LotStatus,
  TaskStatus,
  Priority,
  ArtisanStatus,
} from "@/lib/mockData";
import {
  lotStatusLabel,
  taskStatusLabel,
  priorityLabel,
  artisanStatusLabel,
} from "@/lib/mockData";

type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "muted";

const toneClass: Record<Tone, string> = {
  neutral: "bg-secondary text-secondary-foreground border-transparent",
  info: "bg-info/15 text-info border-transparent",
  success: "bg-success/15 text-success border-transparent",
  warning: "bg-warning/20 text-warning-foreground border-transparent",
  danger: "bg-destructive/15 text-destructive border-transparent",
  muted: "bg-muted text-muted-foreground border-transparent",
};

export function StatusPill({ tone, children, className }: { tone: Tone; children: ReactNode; className?: string }) {
  return (
    <Badge variant="outline" className={cn("font-medium", toneClass[tone], className)}>
      {children}
    </Badge>
  );
}

const lotTone: Record<LotStatus, Tone> = {
  a_etudier: "muted",
  devis_demande: "info",
  devis_recu: "info",
  valide: "success",
  en_cours: "warning",
  termine: "success",
  bloque: "danger",
};

export function LotStatusBadge({ status }: { status: LotStatus }) {
  return <StatusPill tone={lotTone[status]}>{lotStatusLabel[status]}</StatusPill>;
}

const taskTone: Record<TaskStatus, Tone> = {
  a_faire: "muted",
  en_cours: "warning",
  termine: "success",
  bloque: "danger",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <StatusPill tone={taskTone[status]}>{taskStatusLabel[status]}</StatusPill>;
}

const priorityTone: Record<Priority, Tone> = {
  basse: "muted",
  moyenne: "info",
  haute: "warning",
  critique: "danger",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <StatusPill tone={priorityTone[priority]}>{priorityLabel[priority]}</StatusPill>;
}

const artisanTone: Record<ArtisanStatus, Tone> = {
  a_contacter: "muted",
  contacte: "info",
  devis_recu: "info",
  retenu: "success",
  ecarte: "danger",
};

export function ArtisanStatusBadge({ status }: { status: ArtisanStatus }) {
  return <StatusPill tone={artisanTone[status]}>{artisanStatusLabel[status]}</StatusPill>;
}
