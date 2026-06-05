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
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { updateArtisan, deleteArtisan } from "@/lib/services/artisans";
import type { Artisan, ArtisanStatus } from "@/lib/types";

interface FormEditArtisanProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artisan: Artisan;
  onUpdated: (artisan: Artisan) => void;
  onDeleted: (artisanId: string) => void;
}

export function FormEditArtisan({
  open, onOpenChange, artisan, onUpdated, onDeleted,
}: FormEditArtisanProps) {
  const [fields, setFields] = useState({
    name: artisan.name,
    trade: artisan.trade,
    phone: artisan.phone,
    email: artisan.email,
    status: artisan.status as string,
    trust_rating: String(artisan.trustRating),
    notes: artisan.notes,
  });
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync fields when artisan prop changes
  const set = (k: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const updated = await updateArtisan(artisan.id, {
        name: fields.name.trim(),
        trade: fields.trade.trim(),
        phone: fields.phone.trim(),
        email: fields.email.trim(),
        status: fields.status as ArtisanStatus,
        trustRating: Number(fields.trust_rating),
        notes: fields.notes.trim(),
      });
      toast.success("Artisan mis à jour.");
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
      await deleteArtisan(artisan.id);
      toast.success("Artisan supprimé.");
      setDeleteOpen(false);
      onOpenChange(false);
      onDeleted(artisan.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  };

  const canSubmit = fields.name.trim() && fields.trade.trim() && !loading;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier l'artisan</DialogTitle>
            <DialogDescription>Modifiez les informations de cet artisan.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-artisan-name">Nom / Entreprise *</Label>
              <Input
                id="edit-artisan-name"
                placeholder="Ex. : Dupont Plomberie"
                value={fields.name}
                onChange={set("name")}
                autoFocus
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-artisan-trade">Métier *</Label>
              <Input
                id="edit-artisan-trade"
                placeholder="Ex. : Plombier, Électricien…"
                value={fields.trade}
                onChange={set("trade")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-artisan-phone">Téléphone</Label>
                <Input
                  id="edit-artisan-phone"
                  placeholder="06 00 00 00 00"
                  value={fields.phone}
                  onChange={set("phone")}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-artisan-email">Email</Label>
                <Input
                  id="edit-artisan-email"
                  type="email"
                  placeholder="contact@exemple.fr"
                  value={fields.email}
                  onChange={set("email")}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Statut</Label>
              <Select
                value={fields.status}
                onValueChange={(v) => setFields((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a_contacter">À contacter</SelectItem>
                  <SelectItem value="contacte">Contacté</SelectItem>
                  <SelectItem value="devis_recu">Devis reçu</SelectItem>
                  <SelectItem value="retenu">Retenu</SelectItem>
                  <SelectItem value="ecarte">Écarté</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label>Confiance (1–5)</Label>
              <Select
                value={fields.trust_rating}
                onValueChange={(v) => setFields((f) => ({ ...f, trust_rating: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} étoile{n > 1 ? "s" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="edit-artisan-notes">Note</Label>
              <Textarea
                id="edit-artisan-notes"
                placeholder="Remarques libres…"
                value={fields.notes}
                onChange={set("notes")}
                rows={3}
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
            <AlertDialogTitle>Supprimer l'artisan ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'artisan{" "}
              <strong>{artisan.name}</strong> sera supprimé définitivement.
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
