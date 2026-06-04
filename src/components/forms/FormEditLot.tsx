import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateLot, deleteLot } from "@/lib/services/lots";
import type { Lot, LotStatus, Priority } from "@/lib/types";

interface FormEditLotProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lot: Lot;
  onUpdated?: (lot: Lot) => void;
  onDeleted?: (lotId: string) => void;
}

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

export function FormEditLot({ open, onOpenChange, lot, onUpdated, onDeleted }: FormEditLotProps) {
  const [name, setName] = useState(lot.name);
  const [status, setStatus] = useState<LotStatus>(lot.status);
  const [priority, setPriority] = useState<Priority>(lot.priority);
  const [budgetPlanned, setBudgetPlanned] = useState(String(lot.budgetPlanned));
  const [notes, setNotes] = useState(lot.notes);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(lot.name);
      setStatus(lot.status);
      setPriority(lot.priority);
      setBudgetPlanned(String(lot.budgetPlanned));
      setNotes(lot.notes);
    }
  }, [open, lot]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const updated = await updateLot(lot.id, {
        name: name.trim(),
        status,
        priority,
        budget_planned: budgetPlanned ? Number(budgetPlanned) : 0,
        notes: notes.trim(),
      });
      toast.success("Lot mis à jour.");
      onUpdated?.({ ...updated, quoteReceived: lot.quoteReceived });
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour du lot.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteLot(lot.id);
      toast.success("Lot supprimé.");
      onDeleted?.(lot.id);
      setDeleteOpen(false);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression du lot.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const canSubmit = name.trim().length > 0 && !loading;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le lot</DialogTitle>
            <DialogDescription className="sr-only">
              Formulaire de modification d'un lot travaux.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-lot-name">Nom du lot *</Label>
              <Input
                id="edit-lot-name"
                placeholder="Ex. : Plomberie, Électricité…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Statut</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as LotStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABELS) as LotStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label>Priorité</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(PRIORITY_LABELS) as Priority[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-lot-budget">Budget prévu (€)</Label>
              <Input
                id="edit-lot-budget"
                type="number"
                min="0"
                step="100"
                placeholder="0"
                value={budgetPlanned}
                onChange={(e) => setBudgetPlanned(e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-lot-notes">Notes</Label>
              <Textarea
                id="edit-lot-notes"
                placeholder="Remarques libres…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex w-full items-center justify-between gap-2">
            <div>
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
                disabled={loading}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Supprimer
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                {loading ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce lot ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le lot <strong>{lot.name}</strong> sera supprimé définitivement. Cette action est
              irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
