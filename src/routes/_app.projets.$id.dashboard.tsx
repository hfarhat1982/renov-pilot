import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Wallet, TrendingDown, TrendingUp, Gauge,
  AlertTriangle, CircleAlert, Info, ArrowRight, Plus,
  CheckSquare, Clock, ListTodo, StickyNote,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LotStatusBadge, PriorityBadge } from "@/components/StatusBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatDate, formatEUR, projectStatusLabel } from "@/lib/mockData";
import { getProjectById, getProjectStats } from "@/lib/services/projects";
import { getLotsByProject } from "@/lib/services/lots";
import { getTasksByProject } from "@/lib/services/tasks";
import { getAlertsByProjectOnly } from "@/lib/services/alerts";
import { getDecisionsByProject } from "@/lib/services/decisions";
import { getNotesByProject } from "@/lib/services/notes";
import { FormAddNote } from "@/components/forms/FormAddNote";
import type { Project, Lot, Task, Alert, Decision, Note } from "@/lib/types";

export const Route = createFileRoute("/_app/projets/$id/dashboard")({
  head: () => ({ meta: [{ title: "Tableau de bord — RenoV Pilot" }] }),
  component: Dashboard,
});

const Spinner = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const alertIcon = { critical: CircleAlert, warning: AlertTriangle, info: Info } as const;
const alertTone = {
  critical: "text-destructive bg-destructive/10",
  warning: "text-warning-foreground bg-warning/20",
  info: "text-info bg-info/10",
} as const;

type Stats = Awaited<ReturnType<typeof getProjectStats>>;
type Data = { project: Project; stats: Stats; lots: Lot[]; tasks: Task[]; alerts: Alert[]; decisions: Decision[]; notes: Note[] };

function Dashboard() {
  const { id } = Route.useParams();
  const [data, setData] = useState<Data | null | "not-found">(null);
  const [noteOpen, setNoteOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProjectById(id).then(async (project) => {
      if (cancelled) return;
      if (!project) { setData("not-found"); return; }
      const [stats, lots, tasks, alerts, decisions, notes] = await Promise.all([
        getProjectStats(project.id),
        getLotsByProject(project.id),
        getTasksByProject(project.id),
        getAlertsByProjectOnly(project.id),
        getDecisionsByProject(project.id),
        getNotesByProject(project.id),
      ]);
      if (!cancelled) setData({ project, stats, lots, tasks, alerts, decisions, notes });
    });
    return () => { cancelled = true; };
  }, [id]);

  if (data === "not-found") return <div className="py-12 text-center text-muted-foreground">Projet introuvable.</div>;
  if (!data) return <Spinner />;

  const { project, stats, lots, tasks, alerts, decisions, notes } = data;
  const today = new Date().toISOString().split("T")[0];
  const priorityOrder = { critique: 0, haute: 1, moyenne: 2, basse: 3 } as const;
  const urgentDecisions = decisions
    .filter((d) => d.status === "a_trancher")
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 3);
  const criticalLots = lots.filter((l) => l.priority === "critique" && l.status !== "termine").slice(0, 5);
  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== "termine")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  // KPIs tâches
  const tasksTotal = tasks.length;
  const tasksTodo = tasks.filter((t) => t.status === "a_faire").length;
  const tasksInProgress = tasks.filter((t) => t.status === "en_cours").length;
  const tasksDone = tasks.filter((t) => t.status === "termine").length;
  const tasksLate = tasks.filter(
    (t) => t.status !== "termine" && t.dueDate && t.dueDate < today,
  ).length;

  // Dernières notes (5 max)
  const recentNotes = [...notes]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  // Alertes calculées
  const isBudgetOverrun = stats.remaining < 0;
  const hasLateTasks = tasksLate > 0;
  const hasBlockedLots = lots.some((l) => l.status === "bloque");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        description={`${project.name} — ${project.surface} m² · ${projectStatusLabel[project.status]}`}
        actions={
          <>
            <Button asChild variant="outline" size="sm">
              <Link to="/projets/$id" params={{ id: project.id }}>
                Voir le projet<ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setNoteOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />Ajouter note
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Budget cible" value={formatEUR(stats.target)} hint={`Prévu (avec marge) : ${formatEUR(stats.budgetPlanned)}`} icon={<Wallet className="h-4 w-4" />} />
        <StatCard label="Engagé" value={formatEUR(stats.engaged)} hint="Devis reçus + coûts réels" icon={<TrendingUp className="h-4 w-4" />} tone="info" />
        <StatCard label="Reste à prévoir" value={formatEUR(stats.remaining)} hint={`sur ${formatEUR(stats.target)}`} icon={<TrendingDown className="h-4 w-4" />} tone={stats.remaining < 0 ? "danger" : "success"} />
        <StatCard label="Avancement" value={`${stats.progress}%`} hint={`${stats.lotsDone} / ${stats.lotsTotal} lots terminés`} icon={<Gauge className="h-4 w-4" />} />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3"><CardTitle className="text-base">Avancement global</CardTitle></CardHeader>
        <CardContent><Progress value={stats.progress} className="h-2" /></CardContent>
      </Card>

      {/* Alertes calculées */}
      {(isBudgetOverrun || hasLateTasks || hasBlockedLots) && (
        <div className="space-y-2">
          {isBudgetOverrun && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <CircleAlert className="h-4 w-4 shrink-0 text-destructive" />
              <span>Budget dépassé de <span className="font-medium text-destructive">{formatEUR(Math.abs(stats.remaining))}</span></span>
            </div>
          )}
          {hasLateTasks && (
            <div className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 text-warning-foreground" />
              <span><span className="font-medium">{tasksLate}</span> tâche{tasksLate > 1 ? "s" : ""} en retard</span>
            </div>
          )}
          {hasBlockedLots && (
            <div className="flex items-center gap-3 rounded-lg border border-warning/40 bg-warning/5 p-3 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0 text-warning-foreground" />
              <span>Des lots sont bloqués — vérifiez les lots travaux</span>
            </div>
          )}
        </div>
      )}

      {/* KPIs tâches */}
      {tasksTotal > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="À faire" value={String(tasksTodo)} icon={<ListTodo className="h-4 w-4" />} />
          <StatCard label="En cours" value={String(tasksInProgress)} icon={<Clock className="h-4 w-4" />} tone="info" />
          <StatCard label="Terminées" value={String(tasksDone)} icon={<CheckSquare className="h-4 w-4" />} tone="success" />
          <StatCard label="En retard" value={String(tasksLate)} icon={<AlertTriangle className="h-4 w-4" />} tone={tasksLate > 0 ? "danger" : "success"} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Alertes chantier</CardTitle>
            <span className="text-xs text-muted-foreground">{alerts.length} actives</span>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Aucune alerte.</p>}
            {alerts.map((a) => {
              const Icon = alertIcon[a.level];
              return (
                <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${alertTone[a.level]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-snug">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(a.date)}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Points critiques à venir</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {criticalLots.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Aucun lot critique.</p>}
            {criticalLots.map((lot) => (
              <div key={lot.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{lot.name}</p>
                  <p className="text-xs text-muted-foreground">Budget prévu : {formatEUR(lot.budgetPlanned)}</p>
                </div>
                <LotStatusBadge status={lot.status} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {urgentDecisions.length > 0 && (
        <Card className="border-warning/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Décisions à trancher</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/projets/$id/journal" params={{ id: project.id }}>Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {urgentDecisions.map((d) => (
              <div key={d.id} className="flex items-start justify-between gap-3 rounded-lg border border-border/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{d.title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{d.context}</p>
                </div>
                <PriorityBadge priority={d.priority} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Prochaines tâches</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/projets/$id/taches" params={{ id: project.id }}>Tout voir</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingTasks.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">Aucune tâche.</p>}
          {upcomingTasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">Échéance : {formatDate(t.dueDate)} · {t.owner}</p>
              </div>
              <PriorityBadge priority={t.priority} />
            </div>
          ))}
        </CardContent>
      </Card>

      {recentNotes.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Notes récentes</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/projets/$id/journal" params={{ id: project.id }}>Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentNotes.map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-lg border border-border/60 p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary/60">
                  <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{n.title}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{n.body}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(n.date)} · {n.author}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <FormAddNote open={noteOpen} onOpenChange={setNoteOpen} projectId={project.id} />
    </div>
  );
}
