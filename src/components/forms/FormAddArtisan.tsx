import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
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
import { toast } from "sonner";
import { createArtisan } from "@/lib/services/artisans";
import type { Artisan } from "@/lib/types";

interface FormAddArtisanProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onCreated?: (artisan: Artisan) => void;
}

const defaultState = {
  name: "",
  trade: "",
  phone: "",
  email: "",
  notes: "",
  trust_rating: "3",
  status: "a_contacter" as string,
};

export function FormAddArtisan({ open, onOpenChange, projectId, onCreated }: FormAddArtisanProps) {
  const router = useRouter();
  const [fields, setFields] = useState(defaultState);
  const [loading, setLoading] = useState(false);

  const reset = () => setFields(defaultState);
  const set = (k: keyof typeof defaultState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const artisan = await createArtisan({
        name: fields.name.trim(),
        trade: fields.trade.trim(),
        phone: fields.phone.trim() || undefined,
        email: fields.email.trim() || undefined,
        notes: fields.notes.trim() || undefined,
        trust_rating: Number(fields.trust_rating),
        project_id: projectId,
        status: fields.status as import("@/lib/types").ArtisanStatus,
      });
      toast.success("Artisan ajouté.");
      onCreated?.(artisan);
      reset();
      onOpenChange(false);
      router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'ajout de l'artisan.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = fields.name.trim() && fields.trade.trim() && !loading;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajouter un artisan</DialogTitle>
          <DialogDescription>Renseignez les informations de l'artisan à ajouter au projet.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="artisan-name">Nom / Entreprise *</Label>
            <Input
              id="artisan-name"
              placeholder="Ex. : Dupont Plomberie"
              value={fields.name}
              onChange={set("name")}
              autoFocus
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="artisan-trade">Métier *</Label>
            <Input
              id="artisan-trade"
              placeholder="Ex. : Plombier, Électricien…"
              value={fields.trade}
              onChange={set("trade")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="artisan-phone">Téléphone</Label>
              <Input
                id="artisan-phone"
                placeholder="06 00 00 00 00"
                value={fields.phone}
                onChange={set("phone")}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="artisan-email">Email</Label>
              <Input
                id="artisan-email"
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
            <Label htmlFor="artisan-notes">Note</Label>
            <Textarea
              id="artisan-notes"
              placeholder="Remarques libres…"
              value={fields.notes}
              onChange={set("notes")}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {loading ? "Enregistrement…" : "Ajouter l'artisan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
