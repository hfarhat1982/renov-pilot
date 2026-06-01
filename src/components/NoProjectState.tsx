import { Link } from "@tanstack/react-router";
import { FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NoProjectState() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <FolderKanban className="h-6 w-6" />
      </div>
      <div>
        <p className="font-medium">Aucun projet actif</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Créez votre premier projet pour commencer le suivi.
        </p>
      </div>
      <Button asChild>
        <Link to="/dashboard">Créer mon premier projet</Link>
      </Button>
    </div>
  );
}
