import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusPill } from "@/components/StatusBadges";
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
import { cn } from "@/lib/utils";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Gauge,
  AlertTriangle,
  CircleAlert,
  Plus,
  Pencil,
} from "lucide-react";
import { formatEUR, RESERVE, budgetRiskLevelLabel } from "@/lib/mockData";
import type { BudgetRiskLevel } from "@/lib/mockData";
import { getBudgetScenarioStats } from "@/lib/mock/stats";
import { getActiveProject, getProjectStats } from "@/lib/services/projects";
import { getLotsByProject } from "@/lib/services/lots";
import { FormAddDevis } from "@/components/forms/FormAddDevis";
import { FormLotScenario } from "@/components/forms/FormLotScenario";

export const Route = createFileRoute("/_app/budget")({
  head: () => ({ meta: [{ title: "Budget — RenoV Pilot" }] }),
  loader: async () => {
    const project = await getActiveProject();
    const [lots, stats] = await Promise.all([
      getLotsByProject(project.id),
      getProjectStats(project.id),
    ]);
    const scenarioStats = getBudgetScenarioStats(lots, RESERVE, project.budgetTarget);
    return { project, lots, stats, scenarioStats };
  },
  component: BudgetPage,
});

const riskTone: Record<BudgetRiskLevel, "success" | "info" | "warning" | "danger"> = {
  faible: "success",
  moyen: "info",
  eleve: "warning",
  critique: "danger",
};

function fmtScenario(v: number | null): string {
  return v === null ? "À chiffrer" : formatEUR(v);
}

function BudgetPage() {
  const { project, lots: projectLots, stats, scenarioStats } = Route.useLoaderData();
  const {
    optimisticTotal,
    retainedTotal,
    pessimisticTotal,
    retainedWithReserve,
    pessimisticWithReserve,
    targetGapRetained,
    targetGapPessimistic,
  } = scenarioStats;

  const [devisOpen, setDevisOpen] = useState(false);
  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [activeLotId, setActiveLotId] = useState<string | undefined>();

  const totalQuoteMin = projectLots.reduce((s, l) => s + (l.quoteReceived ?? 0), 0);
  const totalReal = projectLots.reduce((s, l) => s + (l.realCost ?? 0), 0);

  const openScenario = (id: string) => {
    setActiveLotId(id);
    setScenarioOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budget"
        description="Scénarios budgétaires et suivi des coûts par lot."
        actions={
          <Button size="sm" variant="outline" onClick={() => setDevisOpen(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Ajouter devis
          </Button>
        }
      />

      {/* Résumé budget actuel */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Budget cible"
          value={formatEUR(project.budgetTarget)}
          icon={<Wallet className="h-4 w-4" />}
        />
        <StatCard
          label="Engagé"
          value={formatEUR(stats.engaged)}
          hint="Devis retenus + coûts réels"
          icon={<TrendingUp className="h-4 w-4" />}
          tone="info"
        />
        <StatCard
          label="Reste disponible"
          value={formatEUR(project.budgetTarget - stats.engaged)}
          hint={`sur ${formatEUR(project.budgetTarget)}`}
          icon={<TrendingDown className="h-4 w-4" />}
          tone={project.budgetTarget - stats.engaged < 0 ? "danger" : "success"}
        />
        <StatCard
          label="Avancement"
          value={`${stats.progress}%`}
          hint={`${stats.lotsDone} / ${stats.lotsTotal} lots terminés`}
          icon={<Gauge className="h-4 w-4" />}
        />
      </div>

      {/* Scénarios budgétaires */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">
          Scénarios budgétaires — réserve imprévus {formatEUR(RESERVE)} incluse
        </p>
        {/* Résumé compact mobile (3 chiffres côte à côte) */}
        <div className="rounded-lg border border-border/60 bg-card p-4 sm:hidden">
          <div className="grid grid-cols-3 divide-x divide-border/60 text-center">
            <div className="pr-2">
              <p className="text-[11px] text-muted-foreground">Optimiste</p>
              <p
                className={cn(
                  "mt-0.5 text-sm font-semibold tabular-nums",
                  optimisticTotal + RESERVE <= project.budgetTarget
                    ? "text-success"
                    : "text-warning-foreground",
                )}
              >
                {formatEUR(optimisticTotal + RESERVE)}
              </p>
            </div>
            <div className="px-2">
              <p className="text-[11px] text-muted-foreground">Retenu</p>
              <p
                className={cn(
                  "mt-0.5 text-sm font-semibold tabular-nums",
                  targetGapRetained < 0 ? "text-warning-foreground" : "text-foreground",
                )}
              >
                {formatEUR(retainedWithReserve)}
              </p>
            </div>
            <div className="pl-2">
              <p className="text-[11px] text-muted-foreground">Pessimiste</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-destructive">
                {formatEUR(pessimisticWithReserve)}
              </p>
            </div>
          </div>
        </div>

        {/* Cartes détaillées sur sm+ */}
        <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4">
          <StatCard
            label="Optimiste"
            value={formatEUR(optimisticTotal + RESERVE)}
            hint={`Lots seuls : ${formatEUR(optimisticTotal)}`}
            icon={<TrendingDown className="h-4 w-4" />}
            tone={optimisticTotal + RESERVE <= project.budgetTarget ? "success" : "warning"}
          />
          <StatCard
            label="Retenu (pilotage)"
            value={formatEUR(retainedWithReserve)}
            hint={`Lots seuls : ${formatEUR(retainedTotal)} · Écart cible : ${targetGapRetained >= 0 ? "-" : "+"}${formatEUR(Math.abs(targetGapRetained))}`}
            icon={<Gauge className="h-4 w-4" />}
            tone={targetGapRetained >= 0 ? "info" : "warning"}
          />
          <StatCard
            label="Pessimiste"
            value={formatEUR(pessimisticWithReserve)}
            hint={`Lots seuls : ${formatEUR(pessimisticTotal)} · Écart cible : +${formatEUR(Math.abs(targetGapPessimistic))}`}
            icon={<TrendingUp className="h-4 w-4" />}
            tone="danger"
          />
        </div>
      </div>

      {/* Alertes scénarios */}
      {targetGapRetained < 0 && (
        <Card className="border-warning/40 bg-warning/5 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-warning/20 text-warning-foreground">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <p className="font-medium">Scénario retenu au-dessus du budget cible</p>
              <p className="text-muted-foreground">
                Le scénario de pilotage dépasse de{" "}
                <span className="font-medium text-warning-foreground">
                  {formatEUR(Math.abs(targetGapRetained))}
                </span>{" "}
                le budget cible. Arbitrez les lots avant d'engager de nouvelles dépenses.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      {targetGapPessimistic < 0 && (
        <Card className="border-destructive/40 bg-destructive/5 shadow-sm">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-destructive/15 text-destructive">
              <CircleAlert className="h-4 w-4" />
            </div>
            <div className="text-sm">
              <p className="font-medium">Risque de dépassement important</p>
              <p className="text-muted-foreground">
                En scénario pessimiste, le projet dépasse le budget de{" "}
                <span className="font-medium text-destructive">
                  {formatEUR(Math.abs(targetGapPessimistic))}
                </span>
                . Des arbitrages ou un ajustement du budget cible seront nécessaires.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau desktop */}
      <Card className="hidden border-border/60 shadow-sm md:block">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Détail par lot</CardTitle>
        </CardHeader>
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
                  <TableHead className="min-w-[160px]">Commentaire</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectLots.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="text-right tabular-nums text-success">
                      {fmtScenario(l.budgetOptimistic)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {fmtScenario(l.budgetRetained)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right tabular-nums",
                        l.budgetRiskLevel === "critique" || l.budgetRiskLevel === "eleve"
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      {fmtScenario(l.budgetPessimistic)}
                    </TableCell>
                    <TableCell>
                      <StatusPill tone={riskTone[l.budgetRiskLevel]}>
                        {budgetRiskLevelLabel[l.budgetRiskLevel]}
                      </StatusPill>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatEUR(l.quoteReceived)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {formatEUR(l.realCost)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {l.budgetComment ?? ""}
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openScenario(l.id)}
                        title="Modifier le scénario"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-success">
                    {formatEUR(optimisticTotal)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatEUR(retainedTotal)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums text-destructive">
                    {formatEUR(pessimisticTotal)}
                  </TableCell>
                  <TableCell />
                  <TableCell className="text-right tabular-nums">
                    {formatEUR(totalQuoteMin)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{formatEUR(totalReal)}</TableCell>
                  <TableCell />
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Cards mobile */}
      <div className="space-y-3 md:hidden">
        <p className="text-sm font-medium">Détail par lot</p>
        {projectLots.map((l) => (
          <Card key={l.id} className="border-border/60 shadow-sm">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium leading-tight">{l.name}</p>
                <StatusPill tone={riskTone[l.budgetRiskLevel]}>
                  {budgetRiskLevelLabel[l.budgetRiskLevel]}
                </StatusPill>
              </div>
              <div className="grid grid-cols-3 gap-2 rounded-lg bg-secondary/40 p-2 text-xs">
                <div className="text-center">
                  <p className="text-muted-foreground">Optimiste</p>
                  <p className="font-medium tabular-nums text-success">
                    {fmtScenario(l.budgetOptimistic)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Retenu</p>
                  <p className="font-semibold tabular-nums">{fmtScenario(l.budgetRetained)}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Pessimiste</p>
                  <p
                    className={cn(
                      "font-medium tabular-nums",
                      l.budgetRiskLevel === "critique" || l.budgetRiskLevel === "eleve"
                        ? "text-destructive"
                        : "",
                    )}
                  >
                    {fmtScenario(l.budgetPessimistic)}
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Devis reçu : {formatEUR(l.quoteReceived)}</span>
                <span>Réel : {formatEUR(l.realCost)}</span>
              </div>
              {l.budgetComment && (
                <p className="text-xs text-muted-foreground">{l.budgetComment}</p>
              )}
              <div className="border-t border-border/60 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full justify-start text-xs text-muted-foreground"
                  onClick={() => openScenario(l.id)}
                >
                  <Pencil className="mr-1.5 h-3 w-3" />
                  Modifier le scénario
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Avertissement fixe */}
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

      <FormAddDevis open={devisOpen} onOpenChange={setDevisOpen} lots={projectLots} />
      <FormLotScenario
        open={scenarioOpen}
        onOpenChange={(v) => {
          setScenarioOpen(v);
          if (!v) setActiveLotId(undefined);
        }}
        lots={projectLots}
        defaultLotId={activeLotId}
      />
    </div>
  );
}
