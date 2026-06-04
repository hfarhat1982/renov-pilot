import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusPill } from "@/components/StatusBadges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableFooter,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Wallet, TrendingUp, TrendingDown, Gauge,
  AlertTriangle, CircleAlert, Plus, Pencil,
} from "lucide-react";
import { formatEUR, RESERVE, budgetRiskLevelLabel } from "@/lib/mockData";
import type { BudgetRiskLevel } from "@/lib/mockData";
import { getBudgetScenarioStats } from "@/lib/mock/stats";
import { getProjectById, getProjectStats } from "@/lib/services/projects";
import { getLotsByProject } from "@/lib/services/lots";
import { FormAddDevis } from "@/components/forms/FormAddDevis";
import { FormLotScenario } from "@/components/forms/FormLotScenario";
import type { Project, Lot } from "@/lib/types";

export const Route = createFileRoute("/_app/projets/$id/budget")({
  head: () => ({ meta: [{ title: "Budget — RenoV Pilot" }] }),
  component: BudgetPage,
});

const Spinner = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const riskTone: Record<BudgetRiskLevel, "success" | "info" | "warning" | "danger"> = {
  faible: "success", moyen: "info", eleve: "warning", critique: "danger",
};

function fmtScenario(v: number | null): string {
  return v === null ? "À chiffrer" : formatEUR(v);
}

type Stats = Awaited<ReturnType<typeof getProjectStats>>;
type Data = { project: Project; lots: Lot[]; stats: Stats };

function BudgetPage() {
  const { id } = Route.useParams();
  const [data, setData] = useState<Data | null | "not-found">(null);
  const [devisOpen, setDevisOpen] = useState(false);
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [activeLotId, setActiveLotId] = useState<string | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getProjectById(id).then(async (project) => {
      if (cancelled) return;
      if (!project) { setData("not-found"); return; }
      const [lots, stats] = await Promise.all([getLotsByProject(project.id), getProjectStats(project.id)]);
      if (!cancelled) setData({ project, lots, stats });
    });
    return () => { cancelled = true; };
  }, [id, refreshKey]);

  if (data === "not-found") return <div className="py-12 text-center text-muted-foreground">Projet introuvable.</div>;
  if (!data) return <Spinner />;

  const { project, lots: projectLots, stats } = data;
  const scenarioStats = getBudgetScenarioStats(projectLots, RESERVE, project.budgetTarget);
  const {
    optimisticTotal, retainedTotal, pessimisticTotal,
    retainedWithReserve, pessimisticWithReserve,
    targetGapRetained, targetGapPessimistic,
  } = scenarioStats;
  const totalQuoteMin = projectLots.reduce((s, l) => s + (l.quoteReceived ?? 0), 0);
  const totalReal = projectLots.reduce((s, l) => s + (l.realCost ?? 0), 0);
  const openScenario = (lotId: string) => { setActiveLotId(lotId); setScenarioOpen(true); };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget"
        description="Scénarios budgétaires et suivi des coûts par lot."
        actions={
          <Button size="sm" variant="outline" onClick={() => setDevisOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />Ajouter devis
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Budget cible" value={formatEUR(project.budgetTarget)} icon={<Wallet className="h-4 w-4" />} />
        <StatCard label="Engagé" value={formatEUR(stats.engaged)} hint="Devis retenus + coûts réels" icon={<TrendingUp className="h-4 w-4" />} tone="info" />
        <StatCard label="Reste disponible" value={formatEUR(project.budgetTarget - stats.engaged)} icon={<TrendingDown className="h-4 w-4" />} tone={project.budgetTarget - stats.engaged < 0 ? "danger" : "success"} />
        <StatCard label="Avancement" value={`${stats.progress}%`} hint={`${stats.lotsDone} / ${stats.lotsTotal} lots terminés`} icon={<Gauge className="h-4 w-4" />} />
      </div>

      {projectLots.length === 0 ? (
        <div className="rounded-lg border border-border/60 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
          Ajoutez des lots pour calculer les scénarios budgétaires.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Scénarios budgétaires — réserve imprévus {formatEUR(RESERVE)} incluse</p>
            <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4">
              <StatCard label="Optimiste" value={formatEUR(optimisticTotal + RESERVE)} icon={<TrendingDown className="h-4 w-4" />} tone={optimisticTotal + RESERVE <= project.budgetTarget ? "success" : "warning"} />
              <StatCard label="Retenu (pilotage)" value={formatEUR(retainedWithReserve)} icon={<Gauge className="h-4 w-4" />} tone={targetGapRetained >= 0 ? "info" : "warning"} />
              <StatCard label="Pessimiste" value={formatEUR(pessimisticWithReserve)} icon={<TrendingUp className="h-4 w-4" />} tone="danger" />
            </div>
          </div>

          {targetGapRetained < 0 && (
            <Card className="border-warning/40 bg-warning/5 shadow-sm">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-warning/20 text-warning-foreground"><AlertTriangle className="h-4 w-4" /></div>
                <div className="text-sm">
                  <p className="font-medium">Scénario retenu au-dessus du budget cible</p>
                  <p className="text-muted-foreground">Dépasse de <span className="font-medium text-warning-foreground">{formatEUR(Math.abs(targetGapRetained))}</span> le budget cible.</p>
                </div>
              </CardContent>
            </Card>
          )}
          {targetGapPessimistic < 0 && (
            <Card className="border-destructive/40 bg-destructive/5 shadow-sm">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-destructive/15 text-destructive"><CircleAlert className="h-4 w-4" /></div>
                <div className="text-sm">
                  <p className="font-medium">Risque de dépassement important</p>
                  <p className="text-muted-foreground">Dépasse de <span className="font-medium text-destructive">{formatEUR(Math.abs(targetGapPessimistic))}</span> en pessimiste.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {projectLots.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">Aucun lot pour ce projet.</p>
      ) : (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Détail par lot</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[180px]">Lot</TableHead>
                    <TableHead className="text-right">Optimiste</TableHead>
                    <TableHead className="text-right">Retenu</TableHead>
                    <TableHead className="text-right">Pessimiste</TableHead>
                    <TableHead>Risque</TableHead>
                    <TableHead className="text-right">Devis reçu</TableHead>
                    <TableHead className="text-right">Réel</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projectLots.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.name}</TableCell>
                      <TableCell className="text-right tabular-nums text-success">{fmtScenario(l.budgetOptimistic)}</TableCell>
                      <TableCell className="text-right tabular-nums font-medium">{fmtScenario(l.budgetRetained)}</TableCell>
                      <TableCell className={cn("text-right tabular-nums", l.budgetRiskLevel === "critique" || l.budgetRiskLevel === "eleve" ? "text-destructive" : "text-muted-foreground")}>{fmtScenario(l.budgetPessimistic)}</TableCell>
                      <TableCell><StatusPill tone={riskTone[l.budgetRiskLevel]}>{budgetRiskLevelLabel[l.budgetRiskLevel]}</StatusPill></TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{formatEUR(l.quoteReceived)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">{formatEUR(l.realCost)}</TableCell>
                      <TableCell className="p-1.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openScenario(l.id)}><Pencil className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="font-semibold">Total</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-success">{formatEUR(optimisticTotal)}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{formatEUR(retainedTotal)}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-destructive">{formatEUR(pessimisticTotal)}</TableCell>
                    <TableCell /><TableCell className="text-right tabular-nums">{formatEUR(totalQuoteMin)}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatEUR(totalReal)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <FormAddDevis
        open={devisOpen}
        onOpenChange={setDevisOpen}
        lots={projectLots}
        projectId={id}
        onCreated={() => setRefreshKey((k) => k + 1)}
      />
      <FormLotScenario open={scenarioOpen} onOpenChange={(v) => { setScenarioOpen(v); if (!v) setActiveLotId(undefined); }} lots={projectLots} defaultLotId={activeLotId} />
    </div>
  );
}
