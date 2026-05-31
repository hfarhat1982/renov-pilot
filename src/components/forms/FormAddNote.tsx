import { useState } from "react";
import {
  Dialog,
  DialogContent,
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
import type { Note, Priority } from "@/lib/types";

interface FormAddNoteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultState = {
  title: "",
  body: "",
  type: "note" as Note["type"],
  priority: "moyenne" as Priority,
};

export function FormAddNote({ open, onOpenChange }: FormAddNoteProps) {
  const [fields, setFields] = useState(defaultState);

  const reset = () => setFields(defaultState);

  const handleSubmit = () => {
    toast.success("Note ajoutée — sera persistée avec Supabase.");
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter une note</DialogTitle>
        </DialogHeader>

        <div className="rounded-md bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
          Action simulée — sera persistée avec Supabase.
        </div>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="note-title">Titre *</Label>
            <Input
              id="note-title"
              placeholder="Titre de la note"
              value={fields.title}
              onChange={(e) => setFields({ ...fields, title: e.target.value })}
              autoFocus
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="note-body">Contenu</Label>
            <Textarea
              id="note-body"
              placeholder="Décrivez votre note…"
              value={fields.body}
              onChange={(e) => setFields({ ...fields, body: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Type</Label>
              <Select
                value={fields.type}
                onValueChange={(v) => setFields({ ...fields, type: v as Note["type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="note">Note</SelectItem>
                  <SelectItem value="decision">Décision</SelectItem>
                  <SelectItem value="alerte">Alerte</SelectItem>
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
                  <SelectItem value="basse">Basse</SelectItem>
                  <SelectItem value="moyenne">Moyenne</SelectItem>
                  <SelectItem value="haute">Haute</SelectItem>
                  <SelectItem value="critique">Critique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!fields.title.trim()}>
            Ajouter la note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
