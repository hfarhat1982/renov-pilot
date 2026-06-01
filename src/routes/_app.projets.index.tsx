import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { ArrowRight, FolderKanban } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/StatusBadges";
import { formatEUR, projectStatusLabel } from "@/lib/mockData";
import { getSupabaseProjectsOnly } from "@/lib/services/projects";

export const Route = createFileRoute("/_app/projets/")({
  head: () => ({ meta: [{ title: "Projets — RenoV Pilot" }] }),
  loader: async () => {
    const projects = await getSupabaseProjectsOnly();
    return { projects };
  },
  component: ProjectsList,
});

function ProjectsList() {
  const { projects } = Route.useLoaderData();
  const router = useRouter();

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Projets"
          description="Tous vos projets de rénovation en cours et à venir."
        />
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
            <FolderKanban className="h-6 w-6" />
          </div>
          <div>
            <p className="font-medium">Aucun projet pour le moment</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Créez votre premier projet pour commencer le suivi.
            </p>
          </div>
          <Button onClick={() => router.navigate({ to: "/dashboard" })}>
            Créer mon premier projet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projets"
        description="Tous vos projets de rénovation en cours et à venir."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <Card key={p.id} className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {p.type}
                    {p.surface ? ` · ${p.surface} m²` : ""}
                  </p>
                </div>
                <StatusPill tone="info">{projectStatusLabel[p.status]}</StatusPill>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Budget cible</p>
                  <p className="font-medium">{formatEUR(p.budgetTarget)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Statut</p>
                  <p className="font-medium">{projectStatusLabel[p.status]}</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/projets/$id/dashboard" params={{ id: p.id }}>
                  Ouvrir le projet
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
