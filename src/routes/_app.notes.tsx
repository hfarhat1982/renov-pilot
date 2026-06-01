import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill, PriorityBadge } from "@/components/StatusBadges";
import {
  CheckCircle2,
  AlertTriangle,
  StickyNote,
  Wallet,
  CalendarDays,
  Paperclip,
  Plus,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatDate,
  formatEUR,
  decisionStatusLabel,
  type DecisionStatus,
  type Priority,
  type Note,
} from "@/lib/mockData";
import { getActiveProject } from "@/lib/services/projects";
import { getDecisionsByProject } from "@/lib/services/decisions";
import { getNotes } from "@/lib/services/notes";
import { getLotsByProject } from "@/lib/services/lots";
import { FormAddDecision } from "@/components/forms/FormAddDecision";
import { FormAddPhoto } from "@/components/forms/FormAddPhoto";
import { FormAddNote } from "@/components/forms/FormAddNote";

export const Route = createFileRoute("/_app/notes")({
  head: () => ({ meta: [{ title: "Journal chantier — RenoV Pilot" }] }),
  loader: async () => {
    const project = await getActiveProject();
    const [decisions, notes, lots] = await Promise.all([
      getDecisionsByProject(project.id),
      getNotes(),
      getLotsByProject(project.id),
    ]);
    return { project, decisions, notes, lots };
  },
  component: DecisionsPage,
});

const statusTone: Record<DecisionStatus, "warning" | "success" | "muted"> = {
  a_trancher: "warning",
  validee: "success",
  abandonnee: "muted",
};

const priorityOrder: Record<Priority, number> = {
  critique: 0,
  haute: 1,
  moyenne: 2,
  basse: 3,
};

const noteMeta: Record<
  Note["type"],
  { label: string; tone: "info" | "warning" | "danger" | "success"; icon: typeof StickyNote }
> = {
  decision: { label: "Décision", tone: "success", icon: CheckCircle2 },
  note: { label: "Note", tone: "info", icon: StickyNote },
  alerte: { label: "Alerte", tone: "danger", icon: AlertTriangle },
};

function DecisionsPage() {
  const { project, decisions, notes, lots } = Route.useLoaderData();
  const [mainTab, setMainTab] = useState<"decisions" | "notes">("decisions");
  const [decisionFilter, setDecisionFilter] = useState<"all" | DecisionStatus>("all");
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);

  const filtered = useMemo(
    () =>
      decisions
        .filter((d) => decisionFilter === "all" || d.status === decisionFilter)
        .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    [decisions, decisionFilter],
  );

  const counts = useMemo(
    () => ({
      a_trancher: decisions.filter((d) => d.status === "a_trancher").length,
      validee: decisions.filter((d) => d.status === "validee").length,
      abandonnee: decisions.filter((d) => d.status === "abandonnee").length,
    }),
    [decisions],
  );

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => b.date.localeCompare(a.date)),
    [notes],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal chantier"
        description="Décisions, notes terrain et alertes de votre chantier."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => setDecisionOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Décision
            </Button>
            <Button size="sm" variant="outline" onClick={() => setNoteOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Note
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPhotoOpen(true)}>
              <Camera className="mr-1 h-4 w-4" />
              Photo
            </Button>
          </>
        }
      />

      {/* Onglets principaux */}
      <Tabs value={mainTab} onValueChange={(v) => setMainTab(v as typeof mainTab)}>
        <TabsList className="w-full justify-start bg-secondary/60">
          <TabsTrigger value="decisions">
            Décisions ({decisions.length})
          </TabsTrigger>
          <TabsTrigger value="notes">
            Notes & alertes ({notes.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Section Décisions */}
      {mainTab === "decisions" && (
        <div className="space-y-4">
          <Tabs
            value={decisionFilter}
            onValueChange={(v) => setDecisionFilter(v as typeof decisionFilter)}
          >
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-secondary/60 p-1">
              <TabsTrigger value="all" className="text-xs">
                Toutes ({decisions.length})
              </TabsTrigger>
              <TabsTrigger value="a_trancher" className="text-xs">
                À trancher ({counts.a_trancher})
              </TabsTrigger>
              <TabsTrigger value="validee" className="text-xs">
                Validées ({counts.validee})
              </TabsTrigger>
              <TabsTrigger value="abandonnee" className="text-xs">
                Abandonnées ({counts.abandonnee})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {filtered.map((d) => (
            <Card
              key={d.id}
              className={cn(
                "border-border/60 shadow-sm",
                d.status === "a_trancher" && "border-warning/50",
              )}
            >
              <CardContent className="space-y-3 p-4 sm:space-y-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-semibold leading-snug">{d.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.decisionDate ? formatDate(d.decisionDate) : "Pas encore tranchée"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <PriorityBadge priority={d.priority} />
                    <StatusPill tone={statusTone[d.status]}>
                      {decisionStatusLabel[d.status]}
                    </StatusPill>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{d.context}</p>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Options
                  </p>
                  <ul className="space-y-1">
                    {d.options.map((opt) => {
                      const isSelected = opt === d.selectedOption;
                      return (
                        <li
                          key={opt}
                          className={cn(
                            "flex items-start gap-2 rounded-md px-2 py-1 text-sm",
                            isSelected
                              ? "bg-success/10 font-medium text-success"
                              : "text-muted-foreground",
                          )}
                        >
                          <CheckCircle2
                            className={cn(
                              "mt-0.5 h-3.5 w-3.5 shrink-0",
                              isSelected ? "text-success" : "opacity-0",
                            )}
                          />
                          <span>{opt}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {(d.budgetImpact !== null ||
                  (d.planningImpactDays !== null && d.planningImpactDays !== 0) ||
                  d.linkedDocuments.length > 0) && (
                  <div className="flex flex-wrap items-center gap-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    {d.budgetImpact !== null && (
                      <span className="flex items-center gap-1.5">
                        <Wallet className="h-3.5 w-3.5 shrink-0" />
                        Impact budget :{" "}
                        <span
                          className={cn(
                            "font-medium",
                            d.budgetImpact > 0
                              ? "text-destructive"
                              : d.budgetImpact < 0
                                ? "text-success"
                                : "",
                          )}
                        >
                          {d.budgetImpact > 0 ? "+" : ""}
                          {formatEUR(d.budgetImpact)}
                        </span>
                      </span>
                    )}
                    {d.planningImpactDays !== null && d.planningImpactDays !== 0 && (
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        Planning :{" "}
                        <span
                          className={cn(
                            "font-medium",
                            d.planningImpactDays > 0 ? "text-warning-foreground" : "text-success",
                          )}
                        >
                          {d.planningImpactDays > 0 ? "+" : ""}
                          {d.planningImpactDays} j
                        </span>
                      </span>
                    )}
                    {d.linkedDocuments.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="h-3.5 w-3.5 shrink-0" />
                        {d.linkedDocuments.join(" · ")}
                      </span>
                    )}
                  </div>
                )}

                {d.notes && (
                  <p className="border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    {d.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {filtered.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucune décision pour ce filtre.
            </p>
          )}
        </div>
      )}

      {/* Section Notes & alertes */}
      {mainTab === "notes" && (
        <div className="space-y-3">
          {sortedNotes.length === 0 && (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucune note pour l'instant.
            </p>
          )}
          {sortedNotes.map((n) => {
            const meta = noteMeta[n.type];
            const Icon = meta.icon;
            return (
              <Card key={n.id} className="border-border/60 shadow-sm">
                <CardContent className="flex items-start gap-3 p-4">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                      n.type === "decision" && "bg-success/15 text-success",
                      n.type === "note" && "bg-info/15 text-info",
                      n.type === "alerte" && "bg-destructive/15 text-destructive",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(n.date)} · {n.author}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <FormAddDecision open={decisionOpen} onOpenChange={setDecisionOpen} />
      <FormAddNote open={noteOpen} onOpenChange={setNoteOpen} projectId={project.id} />
      <FormAddPhoto open={photoOpen} onOpenChange={setPhotoOpen} lots={lots} />
    </div>
  );
}
