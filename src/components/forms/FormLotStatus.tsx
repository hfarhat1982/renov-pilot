import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import type { Lot, LotStatus } from "@/lib/types";
import { lotStatusLabel } from "@/lib/mockData";

const statusOptions: LotStatus[] = [
  "a_etudier",
  "devis_demande",
  "devis_recu",
  "valide",
  "en_cours",
  "termine",
  "bloque",
];

interface FormLotStatusProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lots: Lot[];
  defaultLotId?: string;
}

export function FormLotStatus({ open, onOpenChange, lots, defaultLotId }: FormLotStatusProps) {
  const [lotId, setLotId] = useState(defaultLotId ?? "");
  const [newStatus, setNewStatus] = useState<LotStatus>("en_cours");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      const id = defaultLotId ?? "";
      setLotId(id);
      const lot = lots.find((l) => l.id === id);
      setNewStatus(lot?.status ?? "en_cours");
      setComment("");
    }
  }, [open, defaultLotId, lots]);

  const handleLotChange = (id: string) => {
    setLotId(id);
    const lot = lots.find((l) => l.id === id);
    if (lot) setNewStatus(lot.status);
  };

  const handleSubmit = () => {
    const lot = lots.find((l) => l.id === lotId);
    toast.success(`Statut de « ${lot?.name ?? lotId} » mis à jour — sera persisté avec Supabase.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier le statut d'un lot</DialogTitle>
        </DialogHeader>

        <div className="rounded-md bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
          Action simulée — sera persistée avec Supabase.
        </div>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Lot *</Label>
            <Select value={lotId} onValueChange={handleLotChange}>
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

          <div className="grid gap-1.5">
            <Label>Nouveau statut *</Label>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as LotStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {lotStatusLabel[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="lot-status-comment">Commentaire</Label>
            <Textarea
              id="lot-status-comment"
              placeholder="Raison du changement, prochaine étape…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!lotId}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
