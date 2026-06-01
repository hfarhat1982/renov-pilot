import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Ruler, Wallet, Calendar, Target } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { StatusPill, LotStatusBadge, PriorityBadge } from "@/components/StatusBadges";
import { formatDate, formatEUR, projectStatusLabel } from "@/lib/mockData";
import { getProjectById } from "@/lib/services/projects";
import { getLotsByProject } from "@/lib/services/lots";
import { getTasksByProject } from "@/lib/services/tasks";

export const Route = createFileRoute("/_app/projets/$id")({
  head: () => ({ meta: [{ title: "Détail projet — RenoV Pilot" }] }),
  loader: async ({ params }) => {
    const project = await getProjectById(params.id);
    if (!project) throw notFound();
    const [lots, tasks] = await Promise.all([
      getLotsByProject(params.id),
      getTasksByProject(params.id),
    ]);
    return { project, lots, tasks };
  },
  component: ProjectDetail,
  notFoundComponent: () => (
    <div className="py-12 text-center text-muted-foreground">Projet introuvable.</div>
  ),
});

function ProjectDetail() {
  const { project, lots, tasks } = Route.useLoaderData();

  const lotsTotal = lots.length;
  const lotsDone = lots.filter((l) => l.status === "termine").length;
  const progress = lotsTotal > 0 ? Math.round((lotsDone / lotsTotal) * 100) : 0;
  const engaged = lots.reduce((sum, l) => sum + (l.quoteReceived ?? l.realCost ?? 0), 0);
  const activeTasks = tasks.filter((t) => t.status !== "termine");

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sm">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link to="/projets">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Projets
          </Link>
        </Button>
      </div>

      <PageHeader
        title={project.name}
        description={`${project.type}${project.startDate ? ` · démarrage prévu ${formatDate(project.startDate)}` : ""}`}
        actions={<StatusPill tone="info">{projectStatusLabel[project.status]}</StatusPill>}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {project.surface > 0 && (
          <StatCard
            label="Surface"
            value={`${project.surface} m²`}
            icon={<Ruler className="h-4 w-4" />}
          />
        )}
        <StatCard
          label="Budget cible"
          value={formatEUR(project.budgetTarget)}
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="Engagé"
          value={formatEUR(engaged)}
          icon={<Target className="h-4 w-4" />}
          tone="info"
        />
        {project.startDate && (
          <StatCard
            label="Démarrage"
            value={formatDate(project.startDate)}
            icon={<Calendar className="h-4 w-4" />}
          />
        )}
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Avancement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {lotsTotal === 0 ? "Aucun lot créé" : `${lotsDone} / ${lotsTotal} lots terminés`}
            </span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      {project.priorities.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary" />
              Priorités du projet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {project.priorities.map((p: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Lots travaux</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/lots">Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {lots.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Aucun lot pour ce projet.
              </p>
            ) : (
              lots.slice(0, 6).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Prévu : {formatEUR(l.budgetPlanned)}
                    </p>
                  </div>
                  <LotStatusBadge status={l.status} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Tâches actives</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/taches">Tout voir</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeTasks.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Aucune tâche active.
              </p>
            ) : (
              activeTasks.slice(0, 6).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Échéance : {formatDate(t.dueDate)}
                    </p>
                  </div>
                  <PriorityBadge priority={t.priority} />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
