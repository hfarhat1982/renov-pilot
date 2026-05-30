import type { Artisan } from "@/lib/types";
import { artisans } from "@/lib/mock/data";

export async function getArtisans(): Promise<Artisan[]> {
  return artisans;
}

export async function getArtisanById(artisanId: string): Promise<Artisan | undefined> {
  return artisans.find((a) => a.id === artisanId);
}
