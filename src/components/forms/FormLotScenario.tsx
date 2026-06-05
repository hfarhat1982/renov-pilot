import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Lot, BudgetRiskLevel } from "@/lib/types";
import { budgetRiskLevelLabel } from "@/lib/mockData";

const riskLevels: BudgetRiskLevel[] = ["faible", "moyen", "eleve", "critique"];

interface FormLotScenarioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lots: Lot[];
  defaultLotId?: string;
}

export function FormLotScenario({ open, onOpenChange, lots, defaultLotId }: FormLotScenarioProps) {
  const [lotId, setLotId] = useState(defaultLotId ?? "");
  const [optimistic, setOptimistic] = useState("");
  const [retained, setRetained] = useState("");
  const [pessimistic, setPessimistic] = useState("");
  const [riskLevel, setRiskLevel] = useState<BudgetRiskLevel>("moyen");
  const [comment, setComment] = useState("");

  const populateFromLot = (id: string) => {
    const lot = lots.find((l) => l.id === id);
    if (lot) {
      setOptimistic(lot.budgetOptimistic !== null ? String(lot.budgetOptimistic) : "");
      setRetained(lot.budgetRetained !== null ? String(lot.budgetRetained) : "");
      setPessimistic(lot.budgetPessimistic !== null ? String(lot.budgetPessimistic) : "");
      setRiskLevel(lot.budgetRiskLevel);
      setComment(lot.budgetComment ?? "");
    } else {
      setOptimistic("");
      setRetained("");
      setPessimistic("");
      setRiskLevel("moyen");
      setComment("");
    }
  };

  useEffect(() => {
    if (open) {
      const id = defaultLotId ?? "";
      setLotId(id);
      populateFromLot(id);
    }
  }, [open, defaultLotId, lots]);

  const handleLotChange = (id: string) => {
    setLotId(id);
    populateFromLot(id);
  };

  const handleSubmit = () => {
    const lot = lots.find((l) => l.id === lotId);
    toast.success(
      `Scénario de « ${lot?.name ?? lotId} » mis à jour — sera persisté avec Supabase.`,
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier le scénario budgétaire</DialogTitle>
          <DialogDescription>Ajustez les estimations optimiste, retenue et pessimiste pour ce lot.</DialogDescription>
        </DialogHeader>

        <div className="rounded-md bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
          Action simulée — sera persistée avec Supabase.
        </div>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Lot *</Label>
            <Select value={lotId} onValueChange={handleLotChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un lot…" />
              </SelectTrigger>
              <SelectContent>
                {lots.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="grid gap-1.5">
              <Label htmlFor="scen-opt" className="text-success text-xs">
                Optimiste (€)
              </Label>
              <Input
                id="scen-opt"
                type="number"
                placeholder="ex : 1 200"
                value={optimistic}
                onChange={(e) => setOptimistic(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="scen-ret" className="text-xs">
                Retenu (€)
              </Label>
              <Input
                id="scen-ret"
                type="number"
                placeholder="ex : 1 500"
                value={retained}
                onChange={(e) => setRetained(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="scen-pess" className="text-destructive text-xs">
                Pessimiste (€)
              </Label>
              <Input
                id="scen-pess"
                type="number"
                placeholder="ex : 2 500"
                value={pessimistic}
                onChange={(e) => setPessimistic(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Niveau de risque</Label>
            <Select value={riskLevel} onValueChange={(v) => setRiskLevel(v as BudgetRiskLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {riskLevels.map((r) => (
                  <SelectItem key={r} value={r}>
                    {budgetRiskLevelLabel[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="scen-comment">Commentaire</Label>
            <Textarea
              id="scen-comment"
              placeholder="Justification du scénario, risques identifiés…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!lotId}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
