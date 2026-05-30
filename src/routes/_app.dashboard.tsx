import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Gauge,
  AlertTriangle,
  CircleAlert,
  Info,
  ArrowRight,
} from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { LotStatusBadge, PriorityBadge } from "@/components/StatusBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatDate, formatEUR, projectStatusLabel } from "@/lib/mockData";
import { getActiveProject, getProjectStats } from "@/lib/services/projects";
import { getLotsByProject } from "@/lib/services/lots";
import { getTasksByProject } from "@/lib/services/tasks";
import { getAlerts } from "@/lib/services/alerts";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Tableau de bord — RenoV Pilot" }] }),
  loader: async () => {
    const project = await getActiveProject();
    const [stats, lots, tasks, alerts] = await Promise.all([
      getProjectStats(project.id),
      getLotsByProject(project.id),
      getTasksByProject(project.id),
      getAlerts(),
    ]);
    return { project, stats, lots, tasks, alerts };
  },
  component: Dashboard,
});

const alertIcon = {
  critical: CircleAlert,
  warning: AlertTriangle,
  info: Info,
} as const;

const alertTone = {
  critical: "text-destructive bg-destructive/10",
  warning: "text-warning-foreground bg-warning/20",
  info: "text-info bg-info/10",
} as const;

function Dashboard() {
  const { project, stats, lots, tasks, alerts } = Route.useLoaderData();
  const criticalLots = lots
    .filter((l) => l.priority === "critique" && l.status !== "termine")
    .slice(0, 5);
  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== "termine")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tableau de bord"
        description={`${project.name} — ${project.surface} m² · ${projectStatusLabel[project.status]}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/projets/$id" params={{ id: project.id }}>
              Voir le projet
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Budget cible"
          value={formatEUR(stats.target)}
          hint={`Prévu (avec marge) : ${formatEUR(stats.budgetPlanned)}`}
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="Engagé"
          value={formatEUR(stats.engaged)}
          hint="Devis reçus + coûts réels"
          icon={<TrendingUp className="h-4 w-4" />}
          tone="info"
        />
        <StatCard
          label="Reste à prévoir"
          value={formatEUR(stats.remaining)}
          hint={`sur ${formatEUR(stats.target)}`}
          icon={<TrendingDown className="h-4 w-4" />}
          tone={stats.remaining < 0 ? "danger" : "success"}
        />
        <StatCard
          label="Avancement"
          value={`${stats.progress}%`}
          hint={`${stats.lotsDone} / ${stats.lotsTotal} lots terminés`}
          icon={<Gauge className="h-4 w-4" />}
        />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Avancement global</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={stats.progress} className="h-2" />
          <p className="mt-2 text-xs text-muted-foreground">
            Le projet est en phase d'étude technique. La validation du traitement humidité
            conditionne l'enchaînement des lots structurels.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Alertes chantier</CardTitle>
            <span className="text-xs text-muted-foreground">{alerts.length} actives</span>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((a) => {
              const Icon = alertIcon[a.level];
              return (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-lg border border-border/60 p-3"
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${alertTone[a.level]}`}
                  >
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Points critiques à venir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {criticalLots.map((lot) => (
              <div
                key={lot.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{lot.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Budget prévu : {formatEUR(lot.budgetPlanned)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <PriorityBadge priority={lot.priority} />
                  <LotStatusBadge status={lot.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base">Prochaines tâches</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/taches">Tout voir</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcomingTasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/60 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">
                  Échéance : {formatDate(t.dueDate)} · {t.owner}
                </p>
              </div>
              <PriorityBadge priority={t.priority} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
