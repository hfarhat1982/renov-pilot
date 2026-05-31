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
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import type { Lot } from "@/lib/types";

interface FormAddDevisProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lots: Lot[];
  defaultLotId?: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export function FormAddDevis({ open, onOpenChange, lots, defaultLotId }: FormAddDevisProps) {
  const [lotId, setLotId] = useState(defaultLotId ?? "");
  const [artisan, setArtisan] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [comment, setComment] = useState("");

  const reset = () => {
    setLotId(defaultLotId ?? "");
    setArtisan("");
    setAmount("");
    setDate(today());
    setComment("");
  };

  const handleSubmit = () => {
    toast.success("Devis ajouté — sera persisté avec Supabase.");
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
          <DialogTitle>Ajouter un devis</DialogTitle>
        </DialogHeader>

        <div className="rounded-md bg-secondary/60 px-3 py-2 text-xs text-muted-foreground">
          Action simulée — sera persistée avec Supabase.
        </div>

        <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Lot concerné *</Label>
            <Select value={lotId} onValueChange={setLotId}>
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
            <Label htmlFor="devis-artisan">Artisan / entreprise *</Label>
            <Input
              id="devis-artisan"
              placeholder="Nom de l'artisan ou de l'entreprise"
              value={artisan}
              onChange={(e) => setArtisan(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="devis-amount">Montant HT (€) *</Label>
              <Input
                id="devis-amount"
                type="number"
                placeholder="ex : 8 000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="devis-date">Date du devis</Label>
              <Input
                id="devis-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="devis-comment">Commentaire</Label>
            <Textarea
              id="devis-comment"
              placeholder="Points à retenir, zones floues, conditions particulières…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Fichier PDF</Label>
            <div className="flex items-center gap-2 rounded-md border border-dashed border-border/60 bg-secondary/30 px-3 py-3 text-sm text-muted-foreground">
              <Paperclip className="h-4 w-4 shrink-0" />
              <span>L'upload de fichier sera disponible avec Supabase Storage.</span>
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
          <Button onClick={handleSubmit} disabled={!lotId || !artisan.trim() || !amount}>
            Ajouter le devis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
