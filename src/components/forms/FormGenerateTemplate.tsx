import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createLot } from "@/lib/services/lots";
import type { Lot, Priority } from "@/lib/types";

const TEMPLATE_SOUS_SOL: Array<{
  name: string;
  priority: Priority;
  notes: string;
}> = [
  { name: "Étude structure", priority: "critique", notes: "Étude de faisabilité et calcul béton" },
  { name: "Humidité / drainage / cuvelage", priority: "critique", notes: "Traitement de l'humidité et étanchéité" },
  { name: "Décaissement", priority: "haute", notes: "Terrassement intérieur pour gain de hauteur" },
  { name: "Plomberie / pompe de relevage", priority: "haute", notes: "Réseau EU/EV et pompe de relevage si nécessaire" },
  { name: "Électricité", priority: "haute", notes: "Tableau dédié, circuits, éclairage" },
  { name: "VMC / ventilation", priority: "haute", notes: "Ventilation mécanique contrôlée" },
  { name: "Isolation murs", priority: "moyenne", notes: "Isolation thermique et phonique" },
  { name: "Sol", priority: "moyenne", notes: "Chape et revêtement de sol" },
  { name: "Cloisonnement", priority: "moyenne", notes: "Création des pièces et cloisons" },
  { name: "Finitions", priority: "basse", notes: "Peinture, menuiseries intérieures" },
  { name: "Sécurité / conformité", priority: "basse", notes: "Détecteur incendie, conformité ERP si besoin" },
];

interface FormGenerateTemplateProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  existingLotNames: string[];
  onLotsCreated: (lots: Lot[]) => void;
}

export function FormGenerateTemplate({
  open, onOpenChange, projectId, existingLotNames, onLotsCreated,
}: FormGenerateTemplateProps) {
  const [loading, setLoading] = useState(false);

  // Filter out lots that already exist (by name match)
  const toCreate = TEMPLATE_SOUS_SOL.filter(
    (t) => !existingLotNames.some(
      (n) => n.toLowerCase().trim() === t.name.toLowerCase().trim(),
    ),
  );
  const alreadyExist = TEMPLATE_SOUS_SOL.length - toCreate.length;

  const handleGenerate = async () => {
    if (toCreate.length === 0) {
      toast.info("Tous les lots du template existent déjà.");
      onOpenChange(false);
      return;
    }
    setLoading(true);
    try {
      const created: Lot[] = [];
      for (const tmpl of toCreate) {
        const lot = await createLot({
          name: tmpl.name,
          project_id: projectId,
          status: "a_etudier",
          priority: tmpl.priority,
          budget_planned: 0,
          notes: tmpl.notes,
        });
        created.push(lot);
      }
      toast.success(`${created.length} lots générés avec succès.`);
      onLotsCreated(created);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la génération.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Générer les lots de base</DialogTitle>
          <DialogDescription>
            Template "Sous-sol habitable" — {TEMPLATE_SOUS_SOL.length} lots standards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <ul className="space-y-1.5 rounded-lg bg-secondary/40 p-3">
            {TEMPLATE_SOUS_SOL.map((t) => {
              const exists = existingLotNames.some(
                (n) => n.toLowerCase().trim() === t.name.toLowerCase().trim(),
              );
              return (
                <li key={t.name} className="flex items-center gap-2">
                  <span className={exists ? "text-muted-foreground line-through" : ""}>{t.name}</span>
                  {exists && <span className="text-xs text-muted-foreground">(déjà présent)</span>}
                </li>
              );
            })}
          </ul>

          {alreadyExist > 0 && (
            <p className="text-xs text-muted-foreground">
              {alreadyExist} lot{alreadyExist > 1 ? "s" : ""} déjà présent{alreadyExist > 1 ? "s" : ""} — non dupliqué{alreadyExist > 1 ? "s" : ""}.
            </p>
          )}
          {toCreate.length > 0 && (
            <p className="text-sm font-medium">
              {toCreate.length} lot{toCreate.length > 1 ? "s" : ""} seront créés.
            </p>
          )}
        </div>

        <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </Button>
          <Button onClick={handleGenerate} disabled={loading || toCreate.length === 0}>
            {loading ? "Génération…" : `Générer ${toCreate.length} lot${toCreate.length > 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
