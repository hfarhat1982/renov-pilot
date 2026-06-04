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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateQuote, deleteQuote, setRetainedQuote } from "@/lib/services/quotes";
import { getArtisansByProject } from "@/lib/services/artisans";
import { formatEUR } from "@/lib/mockData";
import type { Quote, Lot, Artisan } from "@/lib/types";

interface FormEditDevisProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote;
  lots: Lot[];
  projectId: string;
  onUpdated?: (quote: Quote) => void;
  onDeleted?: (quoteId: string) => void;
}

function initFields(quote: Quote) {
  return {
    lotId: quote.lotId,
    artisanId: quote.artisanId ?? "none",
    artisanNameFree: quote.artisanId ? "" : quote.artisanName,
    amount: String(quote.amount),
    date: quote.quoteDate ?? "",
    isRetained: quote.isRetained,
    comment: quote.comment,
  };
}

export function FormEditDevis({
  open,
  onOpenChange,
  quote,
  lots,
  projectId,
  onUpdated,
  onDeleted,
}: FormEditDevisProps) {
  const [fields, setFields] = useState(() => initFields(quote));
  const [loading, setLoading] = useState(false);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setFields(initFields(quote));
      getArtisansByProject(projectId).then(setArtisans).catch(() => setArtisans([]));
    }
  }, [open, quote, projectId]);

  const hasArtisanSelected = fields.artisanId !== "" && fields.artisanId !== "none";

  const canSubmit =
    !!fields.lotId &&
    !!fields.amount &&
    parseFloat(fields.amount) > 0 &&
    !loading &&
    (hasArtisanSelected ? true : fields.artisanNameFree.trim().length > 0);

  const artisanDisplayName = hasArtisanSelected
    ? (artisans.find((a) => a.id === fields.artisanId)?.name ?? fields.artisanNameFree)
    : fields.artisanNameFree.trim() || quote.artisanName;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const selectedArtisan = artisans.find((a) => a.id === fields.artisanId);
      const wasRetained = quote.isRetained;
      const becomesRetained = fields.isRetained;

      // If becoming retained, clear others first (avoids unique constraint 409)
      if (!wasRetained && becomesRetained) {
        await setRetainedQuote(fields.lotId, quote.id);
      }

      const updated = await updateQuote(quote.id, {
        lotId: fields.lotId,
        artisanId: selectedArtisan ? fields.artisanId : null,
        artisanName: selectedArtisan
          ? selectedArtisan.name
          : fields.artisanNameFree.trim(),
        amountEur: parseFloat(fields.amount),
        quoteDate: fields.date || null,
        // setRetainedQuote already handled is_retained; only pass it for other cases
        isRetained: becomesRetained,
        comment: fields.comment.trim(),
      });

      toast.success("Devis mis à jour.");
      onUpdated?.(updated);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour du devis.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await deleteQuote(quote.id);
      toast.success("Devis supprimé.");
      onDeleted?.(quote.id);
      setDeleteOpen(false);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression du devis.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setDeleteOpen(false);
          onOpenChange(v);
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le devis</DialogTitle>
            <DialogDescription className="sr-only">
              Formulaire de modification d'un devis existant.
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
                onValueChange={(v) =>
                  setFields((f) => ({ ...f, artisanId: v, artisanNameFree: "" }))
                }
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

            {/* Artisan texte libre */}
            {!hasArtisanSelected && (
              <div className="grid gap-1.5">
                <Label htmlFor="edit-devis-artisan-free">
                  Nom de l'artisan / entreprise *
                </Label>
                <Input
                  id="edit-devis-artisan-free"
                  placeholder="Nom libre de l'artisan / entreprise"
                  value={fields.artisanNameFree}
                  onChange={(e) =>
                    setFields((f) => ({ ...f, artisanNameFree: e.target.value }))
                  }
                  disabled={loading}
                />
              </div>
            )}

            {/* Montant + Date */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-devis-amount">Montant HT (€) *</Label>
                <Input
                  id="edit-devis-amount"
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
                <Label htmlFor="edit-devis-date">Date du devis</Label>
                <Input
                  id="edit-devis-date"
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
                id="edit-devis-retained"
                checked={fields.isRetained}
                onCheckedChange={(v) => setFields((f) => ({ ...f, isRetained: !!v }))}
                disabled={loading}
              />
              <Label htmlFor="edit-devis-retained">Devis retenu</Label>
            </div>

            {/* Commentaire */}
            <div className="grid gap-1.5">
              <Label htmlFor="edit-devis-comment">Commentaire</Label>
              <Textarea
                id="edit-devis-comment"
                placeholder="Points à retenir, zones floues, conditions particulières…"
                value={fields.comment}
                onChange={(e) => setFields((f) => ({ ...f, comment: e.target.value }))}
                rows={3}
                disabled={loading}
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
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
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
            <AlertDialogTitle>Supprimer ce devis ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le devis de <strong>{artisanDisplayName}</strong> (
              {formatEUR(quote.amount)}) sera supprimé définitivement. Cette action est
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
