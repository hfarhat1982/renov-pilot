import { useState } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createLot } from "@/lib/services/lots";
import type { Lot, LotStatus, Priority } from "@/lib/types";

interface FormAddLotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onCreated?: (lot: Lot) => void;
}

const defaultState = {
  name: "",
  status: "a_etudier" as LotStatus,
  priority: "moyenne" as Priority,
  budget_planned: "",
  notes: "",
};

const STATUS_LABELS: Record<LotStatus, string> = {
  a_etudier: "À étudier",
  devis_demande: "Devis demandé",
  devis_recu: "Devis reçu",
  valide: "Validé",
  en_cours: "En cours",
  termine: "Terminé",
  bloque: "Bloqué",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  basse: "Basse",
  moyenne: "Moyenne",
  haute: "Haute",
  critique: "Critique",
};

export function FormAddLot({ open, onOpenChange, projectId, onCreated }: FormAddLotProps) {
  const [fields, setFields] = useState(defaultState);
  const [loading, setLoading] = useState(false);

  const reset = () => setFields(defaultState);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const lot = await createLot({
        name: fields.name.trim(),
        project_id: projectId,
        status: fields.status,
        priority: fields.priority,
        budget_planned: fields.budget_planned ? Number(fields.budget_planned) : 0,
        notes: fields.notes.trim() || undefined,
      });
      toast.success("Lot ajouté.");
      onCreated?.(lot);
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'ajout du lot.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = fields.name.trim().length > 0 && !loading;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter un lot travaux</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="lot-name">Nom du lot *</Label>
            <Input
              id="lot-name"
              placeholder="Ex. : Plomberie, Électricité…"
              value={fields.name}
              onChange={(e) => setFields((f) => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Statut</Label>
              <Select
                value={fields.status}
                onValueChange={(v) => setFields((f) => ({ ...f, status: v as LotStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as LotStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label>Priorité</Label>
              <Select
                value={fields.priority}
                onValueChange={(v) => setFields((f) => ({ ...f, priority: v as Priority }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>{PRIORITY_LABELS[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="lot-budget">Budget prévu (€)</Label>
            <Input
              id="lot-budget"
              type="number"
              min="0"
              step="100"
              placeholder="0"
              value={fields.budget_planned}
              onChange={(e) => setFields((f) => ({ ...f, budget_planned: e.target.value }))}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="lot-notes">Notes</Label>
            <Textarea
              id="lot-notes"
              placeholder="Remarques libres…"
              value={fields.notes}
              onChange={(e) => setFields((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {loading ? "Enregistrement…" : "Ajouter le lot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
