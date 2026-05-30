import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill } from "@/components/StatusBadges";
import { cn } from "@/lib/utils";
import { Wallet, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { formatEUR, RESERVE } from "@/lib/mockData";
import { getActiveProject, getProjectStats } from "@/lib/services/projects";
import { getLotsByProject } from "@/lib/services/lots";

export const Route = createFileRoute("/_app/budget")({
  head: () => ({ meta: [{ title: "Budget — RenoV Pilot" }] }),
  loader: async () => {
    const project = await getActiveProject();
    const [lots, stats] = await Promise.all([
      getLotsByProject(project.id),
      getProjectStats(project.id),
    ]);
    return { project, lots, stats };
  },
  component: BudgetPage,
});

function BudgetPage() {
  const { project, lots: projectLots, stats } = Route.useLoaderData();

  type Row = {
    name: string;
    planned: number;
    quoteMin: number | null;
    quoteMax: number | null;
    real: number | null;
    status: string;
    tone: "muted" | "info" | "success" | "warning" | "danger";
  };

  const rows: Row[] = projectLots.map((l) => {
    const min = l.quoteReceived;
    const max = l.quoteReceived ? Math.round(l.quoteReceived * 1.12) : null;
    let status = "À chiffrer";
    let tone: Row["tone"] = "muted";
    if (l.realCost !== null) {
      const diff = l.realCost - l.budgetPlanned;
      status = diff > 0 ? "Dépassement" : "Conforme";
      tone = diff > 0 ? "danger" : "success";
    } else if (l.quoteReceived !== null) {
      const diff = l.quoteReceived - l.budgetPlanned;
      if (diff > l.budgetPlanned * 0.05) {
        status = "Écart";
        tone = "warning";
      } else {
        status = "Dans le budget";
        tone = "info";
      }
    }
    return {
      name: l.name,
      planned: l.budgetPlanned,
      quoteMin: min,
      quoteMax: max,
      real: l.realCost,
      status,
      tone,
    };
  });

  const totalPlanned = rows.reduce((s, r) => s + r.planned, 0);
  const totalQuoteMin = rows.reduce((s, r) => s + (r.quoteMin ?? 0), 0);
  const totalReal = rows.reduce((s, r) => s + (r.real ?? 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Budget" description="Suivi prévu / devis / réel et écarts par lot." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Cible"
          value={formatEUR(project.budgetTarget)}
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="Prévu (avec marge)"
          value={formatEUR(totalPlanned + RESERVE)}
          hint={`Marge imprévus : ${formatEUR(RESERVE)}`}
        />
        <StatCard
          label="Engagé"
          value={formatEUR(stats.engaged)}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="info"
        />
        <StatCard
          label="Reste"
          value={formatEUR(project.budgetTarget - stats.engaged)}
          icon={<TrendingDown className="h-4 w-4" />}
          tone={project.budgetTarget - stats.engaged < 0 ? "danger" : "success"}
        />
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Détail par lot</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lot</TableHead>
                  <TableHead className="text-right">Prévu</TableHead>
                  <TableHead className="text-right">Devis min</TableHead>
                  <TableHead className="text-right">Devis max</TableHead>
                  <TableHead className="text-right">Réel</TableHead>
                  <TableHead className="text-right">Écart</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => {
                  const ref = r.real ?? r.quoteMin;
                  const diff = ref !== null ? ref - r.planned : null;
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatEUR(r.planned)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatEUR(r.quoteMin)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatEUR(r.quoteMax)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">{formatEUR(r.real)}</TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          diff && diff > 0
                            ? "text-destructive"
                            : diff && diff < 0
                              ? "text-success"
                              : "text-muted-foreground",
                        )}
                      >
                        {diff === null ? "—" : (diff > 0 ? "+" : "") + formatEUR(diff)}
                      </TableCell>
                      <TableCell>
                        <StatusPill tone={r.tone}>{r.status}</StatusPill>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Total lots</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatEUR(totalPlanned)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatEUR(totalQuoteMin)}
                  </TableCell>
                  <TableCell />
                  <TableCell className="text-right tabular-nums">{formatEUR(totalReal)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-warning/40 bg-warning/5 shadow-sm">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-warning/20 text-warning-foreground">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Marge imprévus à surveiller</p>
            <p className="text-muted-foreground">
              Le devis maçonnerie dépasse de 400 € le budget prévu. Pensez à arbitrer avant
              d'engager d'autres lots critiques.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
