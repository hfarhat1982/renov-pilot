import { useState } from "react";
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
import { createTask } from "@/lib/services/tasks";
import type { Task, Lot, Priority, TaskStatus } from "@/lib/types";

interface FormAddTaskProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  lots: Lot[];
  onCreated?: (task: Task) => void;
}

const defaultState = {
  title: "",
  lot_id: "" as string,
  priority: "moyenne" as Priority,
  status: "a_faire" as TaskStatus,
  assignee_name: "",
  due_date: "",
  notes: "",
};

const PRIORITY_LABELS: Record<Priority, string> = {
  basse: "Basse",
  moyenne: "Moyenne",
  haute: "Haute",
  critique: "Critique",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  termine: "Terminé",
  bloque: "Bloqué",
};

export function FormAddTask({ open, onOpenChange, projectId, lots, onCreated }: FormAddTaskProps) {
  const [fields, setFields] = useState(defaultState);
  const [loading, setLoading] = useState(false);

  const reset = () => setFields(defaultState);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const task = await createTask({
        title: fields.title.trim(),
        project_id: projectId,
        lot_id: fields.lot_id || null,
        assignee_name: fields.assignee_name.trim() || undefined,
        priority: fields.priority,
        status: fields.status,
        due_date: fields.due_date || null,
        notes: fields.notes.trim() || undefined,
      });
      toast.success("Tâche ajoutée.");
      onCreated?.(task);
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'ajout de la tâche.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = fields.title.trim().length > 0 && !loading;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter une tâche</DialogTitle>
          <DialogDescription className="sr-only">
            Formulaire de création d'une tâche pour le projet courant.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="task-title">Titre *</Label>
            <Input
              id="task-title"
              placeholder="Ex. : Contacter l'architecte, Valider les plans…"
              value={fields.title}
              onChange={(e) => setFields((f) => ({ ...f, title: e.target.value }))}
              autoFocus
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Lot associé</Label>
            <Select
              value={fields.lot_id}
              onValueChange={(v) => setFields((f) => ({ ...f, lot_id: v === "none" ? "" : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aucun lot" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun</SelectItem>
                {lots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label>Statut</Label>
              <Select
                value={fields.status}
                onValueChange={(v) => setFields((f) => ({ ...f, status: v as TaskStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="task-assignee">Responsable</Label>
            <Input
              id="task-assignee"
              placeholder="Votre nom"
              value={fields.assignee_name}
              onChange={(e) => setFields((f) => ({ ...f, assignee_name: e.target.value }))}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="task-due-date">Date d'échéance</Label>
            <Input
              id="task-due-date"
              type="date"
              value={fields.due_date}
              onChange={(e) => setFields((f) => ({ ...f, due_date: e.target.value }))}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="task-notes">Notes</Label>
            <Textarea
              id="task-notes"
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
            {loading ? "Enregistrement…" : "Ajouter la tâche"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
