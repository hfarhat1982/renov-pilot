import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { ArtisanStatusBadge } from "@/components/StatusBadges";
import { Phone, Mail, Star, Plus } from "lucide-react";
import { formatEUR } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getProjectById } from "@/lib/services/projects";
import { getArtisansByProject } from "@/lib/services/artisans";
import { FormAddArtisan } from "@/components/forms/FormAddArtisan";
import type { Artisan } from "@/lib/types";

export const Route = createFileRoute("/_app/projets/$id/artisans")({
  head: () => ({ meta: [{ title: "Artisans — RenoV Pilot" }] }),
  component: ArtisansPage,
});

const Spinner = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

function Rating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("h-3.5 w-3.5", i <= value ? "fill-warning text-warning" : "text-muted-foreground/40")} />
      ))}
    </div>
  );
}

function ArtisansPage() {
  const { id } = Route.useParams();
  const [artisans, setArtisans] = useState<Artisan[] | null | "not-found">(null);
  const [addOpen, setAddOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProjectById(id).then(async (project) => {
      if (cancelled) return;
      if (!project) { setArtisans("not-found"); return; }
      const list = await getArtisansByProject(project.id);
      if (!cancelled) { setProjectId(project.id); setArtisans(list); }
    });
    return () => { cancelled = true; };
  }, [id]);

  if (artisans === "not-found") return <div className="py-12 text-center text-muted-foreground">Projet introuvable.</div>;
  if (artisans === null) return <Spinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Artisans & contacts"
        description="Annuaire des artisans consultés pour le projet."
        actions={
          <Button size="sm" variant="outline" onClick={() => setAddOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />Ajouter un artisan
          </Button>
        }
      />

      {artisans.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Aucun artisan pour ce projet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {artisans.map((a) => (
            <Card key={a.id} className="border-border/60 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold leading-tight">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.trade}</p>
                  </div>
                  <ArtisanStatusBadge status={a.status} />
                </div>
                <div className="space-y-1.5 text-sm">
                  <a href={`tel:${a.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <Phone className="h-3.5 w-3.5" /><span className="tabular-nums">{a.phone}</span>
                  </a>
                  <a href={`mailto:${a.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                    <Mail className="h-3.5 w-3.5" /><span className="truncate">{a.email}</span>
                  </a>
                </div>
                <div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm">
                  <div><p className="text-xs text-muted-foreground">Devis</p><p className="font-medium tabular-nums">{formatEUR(a.quote)}</p></div>
                  <div className="text-right"><p className="text-xs text-muted-foreground">Confiance</p><Rating value={a.trustRating} /></div>
                </div>
                {a.notes && <p className="text-xs text-muted-foreground">{a.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {projectId && (
        <FormAddArtisan
          open={addOpen}
          onOpenChange={setAddOpen}
          projectId={projectId}
          onCreated={(a) => setArtisans((prev) => (Array.isArray(prev) ? [...prev, a] : [a]))}
        />
      )}
    </div>
  );
}
