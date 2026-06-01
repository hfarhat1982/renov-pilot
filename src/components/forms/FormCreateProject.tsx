import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { Hammer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { createProject } from "@/lib/services/projects";

const PROJECT_TYPES = [
  "Rénovation intérieure",
  "Rénovation extérieure",
  "Extension",
  "Aménagement combles",
  "Aménagement sous-sol",
  "Cuisine / salle de bain",
  "Autre",
];

const defaultState = {
  name: "",
  project_type: "Rénovation intérieure",
  surface_m2: "",
  budget_target: "",
  start_date: "",
};

export function FormCreateProject() {
  const router = useRouter();
  const [fields, setFields] = useState(defaultState);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createProject({
        name: fields.name.trim(),
        project_type: fields.project_type,
        surface_m2: fields.surface_m2 ? parseFloat(fields.surface_m2) : 0,
        budget_target: fields.budget_target ? parseFloat(fields.budget_target) : 0,
        start_date: fields.start_date,
      });
      toast.success("Projet créé !");
      router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la création du projet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Hammer className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Créez votre premier projet</h1>
          <p className="text-sm text-muted-foreground">
            Commencez par nommer votre chantier — vous pourrez tout affiner ensuite.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="proj-name">Nom du projet *</Label>
            <Input
              id="proj-name"
              required
              placeholder="Ex. Rénovation sous-sol"
              value={fields.name}
              onChange={(e) => setFields({ ...fields, name: e.target.value })}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Type de projet</Label>
            <Select
              value={fields.project_type}
              onValueChange={(v) => setFields({ ...fields, project_type: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="proj-surface">Surface (m²)</Label>
              <Input
                id="proj-surface"
                type="number"
                min={0}
                step={1}
                placeholder="Ex. 80"
                value={fields.surface_m2}
                onChange={(e) => setFields({ ...fields, surface_m2: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proj-budget">Budget cible (€)</Label>
              <Input
                id="proj-budget"
                type="number"
                min={0}
                step={100}
                placeholder="Ex. 50000"
                value={fields.budget_target}
                onChange={(e) => setFields({ ...fields, budget_target: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="proj-start">Date de début</Label>
            <Input
              id="proj-start"
              type="date"
              value={fields.start_date}
              onChange={(e) => setFields({ ...fields, start_date: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={!fields.name.trim() || loading}>
            {loading ? "Création…" : "Créer le projet"}
          </Button>
        </form>
      </div>
    </div>
  );
}
