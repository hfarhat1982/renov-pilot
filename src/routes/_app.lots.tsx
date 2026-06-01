import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { LotStatusBadge, PriorityBadge } from "@/components/StatusBadges";
import { Plus, Pencil } from "lucide-react";
import { formatEUR } from "@/lib/mockData";
import { resolveActiveProject } from "@/lib/services/projects";
import { getLotsByProject } from "@/lib/services/lots";
import { getArtisans } from "@/lib/services/artisans";
import { NoProjectState } from "@/components/NoProjectState";
import { FormAddDevis } from "@/components/forms/FormAddDevis";
import { FormLotStatus } from "@/components/forms/FormLotStatus";

export const Route = createFileRoute("/_app/lots")({
  head: () => ({ meta: [{ title: "Lots travaux — RenoV Pilot" }] }),
  loader: async () => {
    const project = await resolveActiveProject();
    if (!project) return { noProject: true as const };
    const [lots, artisans] = await Promise.all([getLotsByProject(project.id), getArtisans()]);
    return { noProject: false as const, lots, artisans };
  },
  component: LotsPage,
});

function LotsPage() {
  const data = Route.useLoaderData();
  if (data.noProject) return <NoProjectState />;
  const { lots, artisans } = data;
  const [q, setQ] = useState("");
  const [devisOpen, setDevisOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [activeLotId, setActiveLotId] = useState<string | undefined>();

  const openStatus = (id: string) => {
    setActiveLotId(id);
    setStatusOpen(true);
  };
  const filtered = lots.filter((l) => l.name.toLowerCase().includes(q.toLowerCase()));
  const artisanName = (id: string | null) =>
    id ? (artisans.find((a) => a.id === id)?.name ?? "—") : "—";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lots travaux"
        description="Tous les corps d'état du projet, du devis à la réception."
        actions={
          <Button size="sm" variant="outline" onClick={() => setDevisOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Ajouter devis
          </Button>
        }
      />

      <div className="max-w-sm space-y-1.5">
        <Input placeholder="Rechercher un lot…" value={q} onChange={(e) => setQ(e.target.value)} />
        <p className="text-xs text-muted-foreground">
          {filtered.length} lot{filtered.length > 1 ? "s" : ""}
          {q ? ` pour « ${q} »` : ""}
        </p>
      </div>

      {/* Desktop table */}
      <Card className="hidden border-border/60 shadow-sm md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lot</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead className="text-right">Prévu</TableHead>
                  <TableHead className="text-right">Devis</TableHead>
                  <TableHead className="text-right">Réel</TableHead>
                  <TableHead>Artisan</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="font-medium">{l.name}</div>
                      {l.notes && <div className="text-xs text-muted-foreground">{l.notes}</div>}
                    </TableCell>
                    <TableCell>
                      <LotStatusBadge status={l.status} />
                    </TableCell>
                    <TableCell>
                      <PriorityBadge priority={l.priority} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatEUR(l.budgetPlanned)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatEUR(l.quoteReceived)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatEUR(l.realCost)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {artisanName(l.artisanId)}
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openStatus(l.id)}
                        title="Modifier le statut"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.map((l) => (
          <Card key={l.id} className="border-border/60 shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">{l.name}</p>
                  <p className="text-xs text-muted-foreground">{artisanName(l.artisanId)}</p>
                </div>
                <PriorityBadge priority={l.priority} />
              </div>
              <div className="flex flex-wrap gap-2">
                <LotStatusBadge status={l.status} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">Prévu</p>
                  <p className="font-medium tabular-nums">{formatEUR(l.budgetPlanned)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Devis</p>
                  <p className="font-medium tabular-nums">{formatEUR(l.quoteReceived)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Réel</p>
                  <p className="font-medium tabular-nums">{formatEUR(l.realCost)}</p>
                </div>
              </div>
              {l.notes && <p className="text-xs text-muted-foreground">{l.notes}</p>}
              <div className="border-t border-border/60 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full justify-start text-xs text-muted-foreground"
                  onClick={() => openStatus(l.id)}
                >
                  <Pencil className="mr-1.5 h-3 w-3" />
                  Modifier le statut
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <FormAddDevis open={devisOpen} onOpenChange={setDevisOpen} lots={lots} />
      <FormLotStatus
        open={statusOpen}
        onOpenChange={(v) => {
          setStatusOpen(v);
          if (!v) setActiveLotId(undefined);
        }}
        lots={lots}
        defaultLotId={activeLotId}
      />
    </div>
  );
}
