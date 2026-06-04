import { useState } from "react";
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
import { toast } from "sonner";
import { updateTask, deleteTask } from "@/lib/services/tasks";
import type { Task, Lot, Priority, TaskStatus } from "@/lib/types";

interface FormEditTaskProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  lots: Lot[];
  onUpdated?: (task: Task) => void;
  onDeleted?: (id: string) => void;
}

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

export function FormEditTask({
  open,
  onOpenChange,
  task,
  lots,
  onUpdated,
  onDeleted,
}: FormEditTaskProps) {
  const [fields, setFields] = useState({
    title: task.title,
    lot_id: task.lotId ?? "",
    priority: task.priority,
    status: task.status,
    assignee_name: task.owner,
    due_date: task.dueDate ?? "",
    notes: task.notes ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const updated = await updateTask(task.id, {
        title: fields.title.trim(),
        lot_id: fields.lot_id || null,
        assignee_name: fields.assignee_name.trim(),
        priority: fields.priority,
        status: fields.status,
        due_date: fields.due_date || null,
        notes: fields.notes.trim(),
      });
      toast.success("Tâche mise à jour.");
      onUpdated?.(updated);
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
      await deleteTask(task.id);
      toast.success("Tâche supprimée.");
      setConfirmDelete(false);
      onDeleted?.(task.id);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  };

  const canSubmit = fields.title.trim().length > 0 && !loading;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier la tâche</DialogTitle>
            <DialogDescription className="sr-only">
              Formulaire de modification d'une tâche.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-task-title">Titre *</Label>
              <Input
                id="edit-task-title"
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
              <Label htmlFor="edit-task-assignee">Responsable</Label>
              <Input
                id="edit-task-assignee"
                placeholder="Votre nom"
                value={fields.assignee_name}
                onChange={(e) => setFields((f) => ({ ...f, assignee_name: e.target.value }))}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-task-due-date">Date d'échéance</Label>
              <Input
                id="edit-task-due-date"
                type="date"
                value={fields.due_date}
                onChange={(e) => setFields((f) => ({ ...f, due_date: e.target.value }))}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-task-notes">Notes</Label>
              <Textarea
                id="edit-task-notes"
                placeholder="Remarques libres…"
                value={fields.notes}
                onChange={(e) => setFields((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => setConfirmDelete(true)}
              type="button"
            >
              Supprimer
            </Button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={!canSubmit}>
                {loading ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la tâche ?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <span>
                Cette action est irréversible. La tâche{" "}
                <strong>{task.title}</strong> sera définitivement supprimée.
              </span>
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
