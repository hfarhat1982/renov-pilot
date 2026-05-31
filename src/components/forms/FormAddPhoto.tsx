import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import type { Lot, DocumentItem } from "@/lib/types";
import { documentCategoryLabel } from "@/lib/mockData";

const categories: DocumentItem["category"][] = [
  "photos",
  "plans",
  "devis",
  "factures",
  "declaration",
  "etude_sol",
  "notices",
  "garanties",
];

interface FormAddPhotoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lots: Lot[];
}

export function FormAddPhoto({ open, onOpenChange, lots }: FormAddPhotoProps) {
  const [category, setCategory] = useState<DocumentItem["category"]>("photos");
  const [lotId, setLotId] = useState("");
  const [description, setDescription] = useState("");

  const reset = () => {
    setCategory("photos");
    setLotId("");
    setDescription("");
  };

  const handleSubmit = () => {
    toast.success("Document ajouté — sera persisté avec Supabase Storage.");
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ajouter un document ou une photo</DialogTitle>
        </DialogHeader>

        <div className="rounded-md bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
          Action simulée — sera persistée avec Supabase Storage.
        </div>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Catégorie</Label>
            <Select
              value={category}
              onValueChange={(v) => setCategory(v as DocumentItem["category"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {documentCategoryLabel[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Lot associé (optionnel)</Label>
            <Select value={lotId} onValueChange={setLotId}>
              <SelectTrigger>
                <SelectValue placeholder="Aucun lot spécifique" />
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

          <div className="grid gap-1.5">
            <Label htmlFor="photo-desc">Description</Label>
            <Textarea
              id="photo-desc"
              placeholder="Décrivez le document ou la photo…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              autoFocus
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Fichier</Label>
            <div className="flex aspect-video cursor-not-allowed flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-secondary/20 text-sm text-muted-foreground">
              <ImagePlus className="h-8 w-8 opacity-40" />
              <span>Upload disponible avec Supabase Storage</span>
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
          <Button onClick={handleSubmit}>Ajouter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
