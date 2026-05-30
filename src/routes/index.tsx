import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  Hammer,
  LayoutDashboard,
  Sparkles,
  Wallet,
  ListChecks,
  FileText,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RenoV Pilot — Piloter sereinement vos projets de rénovation" },
      {
        name: "description",
        content:
          "RenoV Pilot est l'assistant de pilotage de chantier pour particuliers exigeants et artisans : lots, budget, devis, artisans, documents et copilote IA.",
      },
      { property: "og:title", content: "RenoV Pilot" },
      { property: "og:description", content: "Pilotez vos projets de rénovation avec clarté." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Hammer, title: "Lots & tâches", text: "Tous vos lots travaux et tâches dans un fil clair, du devis à la réception." },
  { icon: Wallet, title: "Budget maîtrisé", text: "Prévu, devis, réel : un seul tableau pour suivre les écarts et la marge imprévus." },
  { icon: FileText, title: "Documents centralisés", text: "Plans, devis, factures, photos chantier et garanties au même endroit." },
  { icon: Sparkles, title: "Copilote IA", text: "Analysez un devis, détectez les postes oubliés, générez un compte-rendu de chantier." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Hammer className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight">RenoV Pilot</span>
          </div>
          <Button asChild size="sm">
            <Link to="/dashboard">
              Ouvrir l'app
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              MVP — démonstration projet sous-sol
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Pilotez vos projets de rénovation,
              <br />
              <span className="text-primary">sans rien oublier.</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              RenoV Pilot rassemble vos lots, votre budget, vos artisans, vos devis et vos
              documents dans un poste de pilotage clair — pensé pour les particuliers exigeants
              et les petits artisans.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/dashboard">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Ouvrir le tableau de bord
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/projets">Voir le projet exemple</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Tout votre chantier, dans une seule app
          </h2>
          <p className="mt-2 text-muted-foreground">
            Conçu autour d'un vrai projet : l'aménagement d'un sous-sol semi-enterré en
            espace habitable.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border/60 bg-card p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <f.icon className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border/60 bg-secondary/40">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h3 className="text-lg font-semibold">Prêt à piloter votre chantier ?</h3>
            <p className="text-sm text-muted-foreground">Données fictives — aucun compte requis dans cette version.</p>
          </div>
          <Button asChild>
            <Link to="/dashboard">
              Entrer dans l'app
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-muted-foreground sm:px-6">
          © {new Date().getFullYear()} RenoV Pilot — MVP de démonstration
        </div>
      </footer>
    </div>
  );
}
