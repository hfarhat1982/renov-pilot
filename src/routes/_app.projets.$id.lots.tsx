import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { LotStatusBadge, PriorityBadge } from "@/components/StatusBadges";
import { Plus, Pencil } from "lucide-react";
import { formatEUR } from "@/lib/mockData";
import { getProjectById } from "@/lib/services/projects";
import { getLotsByProject } from "@/lib/services/lots";
import { getArtisans } from "@/lib/services/artisans";
import { FormAddDevis } from "@/components/forms/FormAddDevis";
import { FormAddLot } from "@/components/forms/FormAddLot";
import { FormLotStatus } from "@/components/forms/FormLotStatus";
import type { Lot, Artisan } from "@/lib/types";

export const Route = createFileRoute("/_app/projets/$id/lots")({
  head: () => ({ meta: [{ title: "Lots travaux — RenoV Pilot" }] }),
  component: LotsPage,
});

const Spinner = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

type Data = { lots: Lot[]; artisans: Artisan[] };

function LotsPage() {
  const { id } = Route.useParams();
  const [data, setData] = useState<Data | null | "not-found">(null);
  const [q, setQ] = useState("");
  const [addLotOpen, setAddLotOpen] = useState(false);
  const [devisOpen, setDevisOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [activeLotId, setActiveLotId] = useState<string | undefined>();

  useEffect(() => {
    let cancelled = false;
    getProjectById(id).then(async (project) => {
      if (cancelled) return;
      if (!project) { setData("not-found"); return; }
      const [lots, artisans] = await Promise.all([getLotsByProject(project.id), getArtisans()]);
      if (!cancelled) setData({ lots, artisans });
    });
    return () => { cancelled = true; };
  }, [id]);

  if (data === "not-found") return <div className="py-12 text-center text-muted-foreground">Projet introuvable.</div>;
  if (!data) return <Spinner />;

  const { lots, artisans } = data;
  const filtered = lots.filter((l) => l.name.toLowerCase().includes(q.toLowerCase()));
  const artisanName = (aid: string | null) => aid ? (artisans.find((a) => a.id === aid)?.name ?? "—") : "—";
  const openStatus = (lotId: string) => { setActiveLotId(lotId); setStatusOpen(true); };
  const handleLotCreated = (lot: Lot) => setData((d) => d && d !== "not-found" ? { ...d, lots: [...d.lots, lot] } : d);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lots travaux"
        description="Tous les lots du projet, leur budget et leur avancement."
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setAddLotOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />Ajouter un lot
            </Button>
            <Button size="sm" variant="outline" onClick={() => setDevisOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />Ajouter devis
            </Button>
          </div>
        }
      />

      <Input placeholder="Rechercher un lot…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {lots.length === 0 ? "Aucun lot pour ce projet." : "Aucun lot ne correspond à la recherche."}
        </p>
      ) : (
        <>
          <Card className="hidden border-border/60 shadow-sm md:block">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Lot</TableHead>
                      <TableHead>Artisan</TableHead>
                      <TableHead>Priorité</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Budget prévu</TableHead>
                      <TableHead className="text-right">Devis reçu</TableHead>
                      <TableHead className="text-right">Réel</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.name}</TableCell>
                        <TableCell className="text-muted-foreground">{artisanName(l.artisanId)}</TableCell>
                        <TableCell><PriorityBadge priority={l.priority} /></TableCell>
                        <TableCell><LotStatusBadge status={l.status} /></TableCell>
                        <TableCell className="text-right tabular-nums">{formatEUR(l.budgetPlanned)}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{formatEUR(l.quoteReceived)}</TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground">{formatEUR(l.realCost)}</TableCell>
                        <TableCell className="p-1.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openStatus(l.id)}><Pencil className="h-3.5 w-3.5" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3 md:hidden">
            {filtered.map((l) => (
              <Card key={l.id} className="border-border/60 shadow-sm">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium leading-tight">{l.name}</p>
                    <LotStatusBadge status={l.status} />
                  </div>
                  <div className="grid grid-cols-3 gap-2 rounded-lg bg-secondary/40 p-2 text-xs text-center">
                    <div><p className="text-muted-foreground">Prévu</p><p className="font-medium tabular-nums">{formatEUR(l.budgetPlanned)}</p></div>
                    <div><p className="text-muted-foreground">Devis</p><p className="tabular-nums text-muted-foreground">{formatEUR(l.quoteReceived)}</p></div>
                    <div><p className="text-muted-foreground">Réel</p><p className="tabular-nums text-muted-foreground">{formatEUR(l.realCost)}</p></div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/60 pt-2">
                    <PriorityBadge priority={l.priority} />
                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => openStatus(l.id)}>
                      <Pencil className="mr-1 h-3 w-3" />Statut
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      <FormAddLot
        open={addLotOpen}
        onOpenChange={setAddLotOpen}
        projectId={id}
        onCreated={handleLotCreated}
      />
      <FormAddDevis open={devisOpen} onOpenChange={setDevisOpen} lots={lots} />
      <FormLotStatus
        open={statusOpen}
        onOpenChange={(v) => { setStatusOpen(v); if (!v) setActiveLotId(undefined); }}
        lots={lots}
        defaultLotId={activeLotId}
      />
    </div>
  );
}
