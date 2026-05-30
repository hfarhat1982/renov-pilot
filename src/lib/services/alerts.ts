import type { Alert } from "@/lib/types";
import { alerts } from "@/lib/mock/data";

export async function getAlerts(): Promise<Alert[]> {
  return alerts;
}

// TODO: Alert n'a pas encore de champ projectId — retourne toutes les alertes.
// Ajouter projectId à Alert et filtrer ici une fois le schéma mis à jour.
export async function getAlertsByProject(_projectId: string): Promise<Alert[]> {
  return alerts;
}
