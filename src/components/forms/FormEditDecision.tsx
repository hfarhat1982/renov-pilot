import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { updateDecision, deleteDecision } from "@/lib/services/decisions";
import type { Decision, DecisionStatus, Priority } from "@/lib/types";

interface FormEditDecisionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decision: Decision;
  onUpdated: (decision: Decision) => void;
  onDeleted: (decisionId: string) => void;
}

export function FormEditDecision({
  open, onOpenChange, decision, onUpdated, onDeleted,
}: FormEditDecisionProps) {
  const [fields, setFields] = useState({
    title: decision.title,
    context: decision.context,
    options: decision.options.length > 0 ? decision.options : ["", ""],
    selectedOption: decision.selectedOption ?? "",
    status: decision.status as DecisionStatus,
    priority: decision.priority as Priority,
    budgetImpact: decision.budgetImpact != null ? String(decision.budgetImpact) : "",
    planningDays: decision.planningImpactDays != null ? String(decision.planningImpactDays) : "",
    notes: decision.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const updateOption = (i: number, v: string) => {
    const next = [...fields.options];
    next[i] = v;
    setFields({ ...fields, options: next });
  };
  const addOption = () => setFields({ ...fields, options: [...fields.options, ""] });
  const removeOption = (i: number) =>
    setFields({ ...fields, options: fields.options.filter((_, idx) => idx !== i) });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const cleanOptions = fields.options.map((o) => o.trim()).filter(Boolean);
      const updated = await updateDecision(decision.id, {
        title: fields.title.trim(),
        context: fields.context.trim(),
        options: cleanOptions,
        selectedOption: fields.selectedOption.trim() || null,
        status: fields.status,
        priority: fields.priority,
        budgetImpact: fields.budgetImpact ? Number(fields.budgetImpact) : null,
        planningImpactDays: fields.planningDays ? Number(fields.planningDays) : null,
        notes: fields.notes.trim() || undefined,
      });
      toast.success("Décision mise à jour.");
      onUpdated(updated);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteDecision(decision.id);
      toast.success("Décision supprimée.");
      setDeleteOpen(false);
      onOpenChange(false);
      onDeleted(decision.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier la décision</DialogTitle>
            <DialogDescription>Modifiez les informations de cette décision.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-dec-title">Titre *</Label>
              <Input
                id="edit-dec-title"
                placeholder="Intitulé de la décision"
                value={fields.title}
                onChange={(e) => setFields({ ...fields, title: e.target.value })}
                autoFocus
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-dec-context">Contexte</Label>
              <Textarea
                id="edit-dec-context"
                placeholder="Pourquoi cette décision doit-elle être prise ?"
                value={fields.context}
                onChange={(e) => setFields({ ...fields, context: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Options envisagées</Label>
              <div className="space-y-2">
                {fields.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${i + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      className="flex-1"
                    />
                    {fields.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => removeOption(i)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addOption}
                  className="h-8 text-xs"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Ajouter une option
                </Button>
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-dec-selected">Décision retenue</Label>
              <Input
                id="edit-dec-selected"
                placeholder="Option retenue (si déjà tranchée)"
                value={fields.selectedOption}
                onChange={(e) => setFields({ ...fields, selectedOption: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Statut</Label>
                <Select
                  value={fields.status}
                  onValueChange={(v) => setFields({ ...fields, status: v as DecisionStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a_trancher">À trancher</SelectItem>
                    <SelectItem value="validee">Validée</SelectItem>
                    <SelectItem value="abandonnee">Abandonnée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Priorité</Label>
                <Select
                  value={fields.priority}
                  onValueChange={(v) => setFields({ ...fields, priority: v as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critique">Critique</SelectItem>
                    <SelectItem value="haute">Haute</SelectItem>
                    <SelectItem value="moyenne">Moyenne</SelectItem>
                    <SelectItem value="basse">Basse</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-dec-budget">Impact budget (€)</Label>
                <Input
                  id="edit-dec-budget"
                  type="number"
                  placeholder="ex : 500"
                  value={fields.budgetImpact}
                  onChange={(e) => setFields({ ...fields, budgetImpact: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-dec-planning">Impact planning (j)</Label>
                <Input
                  id="edit-dec-planning"
                  type="number"
                  placeholder="ex : 5"
                  value={fields.planningDays}
                  onChange={(e) => setFields({ ...fields, planningDays: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-dec-notes">Notes internes</Label>
              <Textarea
                id="edit-dec-notes"
                placeholder="Remarques, contraintes…"
                value={fields.notes}
                onChange={(e) => setFields({ ...fields, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/5"
              onClick={() => setDeleteOpen(true)}
              disabled={loading}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Supprimer
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={!fields.title.trim() || loading}>
                {loading ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la décision ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La décision{" "}
              <strong>{decision.title}</strong> sera supprimée définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
