import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusPill } from "@/components/StatusBadges";
import { formatEUR, getProjectStats, projects, projectStatusLabel } from "@/lib/mockData";

export const Route = createFileRoute("/_app/projets/")({
  head: () => ({ meta: [{ title: "Projets — RenoV Pilot" }] }),
  component: ProjectsList,
});

function ProjectsList() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projets"
        description="Tous vos projets de rénovation en cours et à venir."
        actions={
          <Button size="sm" disabled>
            <Plus className="mr-1 h-4 w-4" />
            Nouveau projet
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((p) => {
          const s = getProjectStats(p.id);
          return (
            <Card key={p.id} className="border-border/60 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {p.type} · {p.surface} m²
                    </p>
                  </div>
                  <StatusPill tone="info">{projectStatusLabel[p.status]}</StatusPill>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Budget cible</p>
                    <p className="font-medium">{formatEUR(p.budgetTarget)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Engagé</p>
                    <p className="font-medium">{formatEUR(s.engaged)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lots</p>
                    <p className="font-medium">
                      {s.lotsDone}/{s.lotsTotal}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Avancement</span>
                    <span className="font-medium">{s.progress}%</span>
                  </div>
                  <Progress value={s.progress} className="h-1.5" />
                </div>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to="/projets/$id" params={{ id: p.id }}>
                    Ouvrir le projet
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
