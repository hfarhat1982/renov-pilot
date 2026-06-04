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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createQuote } from "@/lib/services/quotes";
import { getArtisansByProject } from "@/lib/services/artisans";
import type { Lot, Artisan } from "@/lib/types";

interface FormAddDevisProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lots: Lot[];
  projectId: string;
  defaultLotId?: string;
  onCreated?: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

const defaultState = {
  lotId: "",
  artisanId: "none",
  artisanNameFree: "",
  amount: "",
  date: today(),
  isRetained: false,
  comment: "",
};

export function FormAddDevis({
  open,
  onOpenChange,
  lots,
  projectId,
  defaultLotId,
  onCreated,
}: FormAddDevisProps) {
  const [fields, setFields] = useState({ ...defaultState, lotId: defaultLotId ?? "" });
  const [loading, setLoading] = useState(false);
  const [artisans, setArtisans] = useState<Artisan[]>([]);

  useEffect(() => {
    if (open && projectId) {
      getArtisansByProject(projectId).then(setArtisans).catch(() => setArtisans([]));
    }
  }, [open, projectId]);

  const reset = () => setFields({ ...defaultState, lotId: defaultLotId ?? "" });

  const hasArtisanSelected = fields.artisanId !== "" && fields.artisanId !== "none";

  const canSubmit =
    !!fields.lotId &&
    !!fields.amount &&
    parseFloat(fields.amount) > 0 &&
    !loading &&
    (hasArtisanSelected ? true : fields.artisanNameFree.trim().length > 0);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const selectedArtisan = artisans.find((a) => a.id === fields.artisanId);
      await createQuote({
        projectId,
        lotId: fields.lotId,
        artisanId: selectedArtisan ? fields.artisanId : null,
        artisanName: selectedArtisan
          ? selectedArtisan.name
          : fields.artisanNameFree.trim(),
        amountEur: parseFloat(fields.amount),
        quoteDate: fields.date || null,
        isRetained: fields.isRetained,
        comment: fields.comment.trim() || undefined,
      });
      toast.success("Devis ajouté.");
      onCreated?.();
      reset();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'ajout du devis.");
    } finally {
      setLoading(false);
    }
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
          <DialogTitle>Ajouter un devis</DialogTitle>
          <DialogDescription className="sr-only">
            Formulaire d'ajout d'un devis pour le projet courant.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Lot */}
          <div className="grid gap-1.5">
            <Label>Lot concerné *</Label>
            <Select
              value={fields.lotId}
              onValueChange={(v) => setFields((f) => ({ ...f, lotId: v }))}
              disabled={loading}
            >
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

          {/* Artisan select */}
          <div className="grid gap-1.5">
            <Label>Artisan (optionnel)</Label>
            <Select
              value={fields.artisanId}
              onValueChange={(v) => setFields((f) => ({ ...f, artisanId: v, artisanNameFree: "" }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un artisan…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun artisan enregistré</SelectItem>
                {artisans.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.trade})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Artisan texte libre (si aucun artisan sélectionné) */}
          {!hasArtisanSelected && (
            <div className="grid gap-1.5">
              <Label htmlFor="devis-artisan-free">Nom de l'artisan / entreprise *</Label>
              <Input
                id="devis-artisan-free"
                placeholder="Nom libre de l'artisan / entreprise"
                value={fields.artisanNameFree}
                onChange={(e) => setFields((f) => ({ ...f, artisanNameFree: e.target.value }))}
                disabled={loading}
              />
            </div>
          )}

          {/* Montant + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="devis-amount">Montant HT (€) *</Label>
              <Input
                id="devis-amount"
                type="number"
                min="0"
                step="1"
                placeholder="ex : 8000"
                value={fields.amount}
                onChange={(e) => setFields((f) => ({ ...f, amount: e.target.value }))}
                disabled={loading}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="devis-date">Date du devis</Label>
              <Input
                id="devis-date"
                type="date"
                value={fields.date}
                onChange={(e) => setFields((f) => ({ ...f, date: e.target.value }))}
                disabled={loading}
              />
            </div>
          </div>

          {/* Retenu */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="devis-retained"
              checked={fields.isRetained}
              onCheckedChange={(v) => setFields((f) => ({ ...f, isRetained: !!v }))}
              disabled={loading}
            />
            <Label htmlFor="devis-retained">Devis retenu</Label>
          </div>

          {/* Commentaire */}
          <div className="grid gap-1.5">
            <Label htmlFor="devis-comment">Commentaire</Label>
            <Textarea
              id="devis-comment"
              placeholder="Points à retenir, zones floues, conditions particulières…"
              value={fields.comment}
              onChange={(e) => setFields((f) => ({ ...f, comment: e.target.value }))}
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {loading ? "Enregistrement…" : "Ajouter le devis"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
