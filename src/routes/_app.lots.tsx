import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { artisans, formatEUR, lots } from "@/lib/mockData";

export const Route = createFileRoute("/_app/lots")({
  head: () => ({ meta: [{ title: "Lots travaux — RenoV Pilot" }] }),
  component: LotsPage,
});

function LotsPage() {
  const [q, setQ] = useState("");
  const filtered = lots.filter((l) => l.name.toLowerCase().includes(q.toLowerCase()));
  const artisanName = (id: string | null) => (id ? artisans.find((a) => a.id === id)?.name ?? "—" : "—");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lots travaux"
        description="Tous les corps d'état du projet, du devis à la réception."
      />

      <div className="max-w-sm">
        <Input placeholder="Rechercher un lot…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {/* Desktop table */}
      <Card className="hidden border-border/60 shadow-sm md:block">
        <CardContent className="p-0">
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((l) => (
                <TableRow key={l.id}>
                  <TableCell>
                    <div className="font-medium">{l.name}</div>
                    {l.notes && <div className="text-xs text-muted-foreground">{l.notes}</div>}
                  </TableCell>
                  <TableCell><LotStatusBadge status={l.status} /></TableCell>
                  <TableCell><PriorityBadge priority={l.priority} /></TableCell>
                  <TableCell className="text-right tabular-nums">{formatEUR(l.budgetPlanned)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEUR(l.quoteReceived)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatEUR(l.realCost)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{artisanName(l.artisanId)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
