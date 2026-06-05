import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Paperclip } from "lucide-react";
import { toast } from "sonner";
import type { DocumentItem } from "@/lib/types";
import { documentCategoryLabel } from "@/lib/mock/labels";
import { uploadDocument, type DocumentRow } from "@/lib/services/documents";

const CATEGORIES: DocumentItem["category"][] = [
  "plans",
  "devis",
  "factures",
  "photos",
  "declaration",
  "etude_sol",
  "notices",
  "garanties",
];

interface FormAddDocumentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  lots: { id: string; name: string }[];
  onCreated?: (doc: DocumentRow) => void;
}

export function FormAddDocument({
  open,
  onOpenChange,
  projectId,
  lots,
  onCreated,
}: FormAddDocumentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentItem["category"]>("plans");
  const [lotId, setLotId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setCategory("plans");
    setLotId("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Sélectionnez un fichier.");
      return;
    }
    setLoading(true);
    try {
      const doc = await uploadDocument(file, category, projectId, lotId || undefined);
      toast.success("Document ajouté.");
      onCreated?.(doc);
      reset();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      if (
        message.includes("403") ||
        message.includes("401") ||
        message.toLowerCase().includes("policy") ||
        message.toLowerCase().includes("policies")
      ) {
        console.error("Upload Storage policy error:", err);
        toast.error("Upload bloqué : policy Storage manquante. Contactez l'administrateur.");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !!file && !loading;

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
          <DialogDescription className="sr-only">
            Formulaire d'ajout d'un document ou d'une photo au projet.
          </DialogDescription>
        </DialogHeader>

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
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {documentCategoryLabel[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {lots.length > 0 && (
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
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="doc-file">Fichier *</Label>
            <label
              htmlFor="doc-file"
              className="flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Paperclip className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {file ? file.name : "Cliquer pour sélectionner un fichier…"}
              </span>
            </label>
            <input
              ref={fileInputRef}
              id="doc-file"
              type="file"
              className="sr-only"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.heif"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} Ko · {file.type || "type inconnu"}
              </p>
            )}
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
            {loading ? "Upload en cours…" : "Ajouter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
