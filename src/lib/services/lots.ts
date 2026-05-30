import type { Lot } from "@/lib/types";
import { lots } from "@/lib/mock/data";

export async function getLots(): Promise<Lot[]> {
  return lots;
}

export async function getLotsByProject(projectId: string): Promise<Lot[]> {
  return lots.filter((l) => l.projectId === projectId);
}

export async function getLotById(lotId: string): Promise<Lot | undefined> {
  return lots.find((l) => l.id === lotId);
}
