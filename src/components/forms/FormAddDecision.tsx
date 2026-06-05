import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createDecision } from "@/lib/services/decisions";
import type { Decision, DecisionStatus, Priority } from "@/lib/types";

interface FormAddDecisionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  onCreated?: (decision: Decision) => void;
}

const defaultState = {
  title: "",
  context: "",
  options: ["", ""],
  selectedOption: "",
  status: "a_trancher" as DecisionStatus,
  priority: "moyenne" as Priority,
  budgetImpact: "",
  planningDays: "",
  notes: "",
};

export function FormAddDecision({ open, onOpenChange, projectId, onCreated }: FormAddDecisionProps) {
  const [fields, setFields] = useState(defaultState);
  const [loading, setLoading] = useState(false);

  const reset = () => setFields(defaultState);

  const updateOption = (i: number, v: string) => {
    const next = [...fields.options];
    next[i] = v;
    setFields({ ...fields, options: next });
  };

  const addOption = () => setFields({ ...fields, options: [...fields.options, ""] });

  const removeOption = (i: number) =>
    setFields({ ...fields, options: fields.options.filter((_, idx) => idx !== i) });

  const handleSubmit = async () => {
    if (!projectId) {
      toast.error("Projet non défini.");
      return;
    }
    setLoading(true);
    try {
      const cleanOptions = fields.options.map((o) => o.trim()).filter(Boolean);
      const decision = await createDecision({
        projectId,
        title: fields.title.trim(),
        context: fields.context.trim() || undefined,
        options: cleanOptions,
        selectedOption: fields.selectedOption.trim() || null,
        status: fields.status,
        priority: fields.priority,
        budgetImpact: fields.budgetImpact ? Number(fields.budgetImpact) : null,
        planningImpactDays: fields.planningDays ? Number(fields.planningDays) : null,
        notes: fields.notes.trim() || undefined,
      });
      toast.success("Décision ajoutée.");
      onCreated?.(decision);
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'ajout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter une décision</DialogTitle>
          <DialogDescription>Enregistrez une décision à prendre ou déjà tranchée.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="dec-title">Titre *</Label>
            <Input
              id="dec-title"
              placeholder="Intitulé de la décision"
              value={fields.title}
              onChange={(e) => setFields({ ...fields, title: e.target.value })}
              autoFocus
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="dec-context">Contexte</Label>
            <Textarea
              id="dec-context"
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
            <Label htmlFor="dec-selected">Décision retenue</Label>
            <Input
              id="dec-selected"
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
              <Label htmlFor="dec-budget">Impact budget (€)</Label>
              <Input
                id="dec-budget"
                type="number"
                placeholder="ex : 500"
                value={fields.budgetImpact}
                onChange={(e) => setFields({ ...fields, budgetImpact: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dec-planning">Impact planning (j)</Label>
              <Input
                id="dec-planning"
                type="number"
                placeholder="ex : 5"
                value={fields.planningDays}
                onChange={(e) => setFields({ ...fields, planningDays: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="dec-notes">Notes internes</Label>
            <Textarea
              id="dec-notes"
              placeholder="Remarques, contraintes…"
              value={fields.notes}
              onChange={(e) => setFields({ ...fields, notes: e.target.value })}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!fields.title.trim() || loading}>
            {loading ? "Enregistrement…" : "Ajouter la décision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
