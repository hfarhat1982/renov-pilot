import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  FileSearch,
  ListChecks,
  Send,
  ClipboardList,
  MessagesSquare,
  FolderArchive,
  AlertCircle,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/_app/copilote")({
  head: () => ({ meta: [{ title: "Copilote IA — RenoV Pilot" }] }),
  component: CopilotPage,
});

type ActionId =
  | "analyse_devis"
  | "postes_oublies"
  | "checklist"
  | "demande_devis"
  | "compte_rendu"
  | "questions_artisan"
  | "synthese";

interface Action {
  id: ActionId;
  title: string;
  description: string;
  icon: typeof Sparkles;
  response: { heading: string; sections: { title: string; items: string[] }[] };
}

const ACTIONS: Action[] = [
  {
    id: "analyse_devis",
    title: "Analyser un devis",
    description: "Repère les zones floues, les unités manquantes et les écarts de prix.",
    icon: FileSearch,
    response: {
      heading: "Analyse du devis Maçonnerie Dupuis & Fils",
      sections: [
        { title: "Points conformes", items: ["TVA correctement détaillée (10% rénovation)", "Décaissement chiffré en m³ avec évacuation des gravats", "Mention du planning prévisionnel"] },
        { title: "Points à clarifier", items: ["Préciser l'épaisseur du dallage béton armé prévu", "Demander si le ferraillage est inclus ou en supplément", "Vérifier l'assurance décennale en cours de validité"] },
        { title: "Écart budgétaire", items: ["Devis à 8 400 € vs budget prévu 8 000 € (+5%)", "Acceptable si la prestation inclut bien l'évacuation"] },
      ],
    },
  },
  {
    id: "postes_oublies",
    title: "Détecter les postes oubliés",
    description: "Vérifie qu'aucun lot critique ne manque pour un sous-sol habitable.",
    icon: AlertCircle,
    response: {
      heading: "Postes potentiellement oubliés",
      sections: [
        { title: "Critique", items: ["Étanchéité périphérique extérieure / drainage", "Reprise éventuelle en sous-œuvre selon étude G2", "Détection radon (zone potentiellement concernée)"] },
        { title: "À vérifier", items: ["Hauteur sous plafond après finitions (mini 2,20 m)", "Apport de lumière naturelle / puits de jour", "Issue de secours conforme pour pièce habitable"] },
        { title: "Confort", items: ["Déshumidificateur d'appoint pendant les 6 premiers mois", "Renforcement acoustique plafond"] },
      ],
    },
  },
  {
    id: "checklist",
    title: "Générer une checklist chantier",
    description: "Une checklist d'ouverture de chantier prête à imprimer.",
    icon: ListChecks,
    response: {
      heading: "Checklist ouverture de chantier",
      sections: [
        { title: "Administratif", items: ["Déclaration préalable affichée sur site", "Attestations décennale + RC pro de chaque artisan", "DICT si terrassement à plus de 40 cm"] },
        { title: "Technique", items: ["Mise hors d'eau provisoire vérifiée", "Coupure générale eau/électricité repérée", "Protection des sols et accès"] },
        { title: "Sécurité", items: ["EPI obligatoires pour visiteurs", "Affichage consignes incendie", "Trousse de premiers secours sur site"] },
      ],
    },
  },
  {
    id: "demande_devis",
    title: "Préparer une demande de devis",
    description: "Un email type prêt à envoyer aux artisans.",
    icon: Send,
    response: {
      heading: "Modèle de demande de devis — Traitement humidité",
      sections: [
        { title: "Objet", items: ["Demande de devis — Traitement humidité sous-sol semi-enterré (35 m²)"] },
        { title: "Contexte", items: ["Projet d'aménagement en pièce habitable", "Étude de sol G2 disponible sur demande", "Présence d'auréoles d'humidité ponctuelles (angle SE)"] },
        { title: "Demande", items: ["Préconisations : cuvelage vs drainage périphérique", "Devis détaillé poste par poste, avec garantie décennale", "Délai d'intervention souhaité : septembre 2026"] },
      ],
    },
  },
  {
    id: "compte_rendu",
    title: "Générer un compte-rendu de chantier",
    description: "Synthétise une réunion ou une visite sur le terrain.",
    icon: ClipboardList,
    response: {
      heading: "Compte-rendu — Visite technique sous-sol",
      sections: [
        { title: "Présents", items: ["Maître d'ouvrage", "Maçonnerie Dupuis & Fils", "Bureau d'études BTP Solutions Sol"] },
        { title: "Constats", items: ["Hauteur disponible : 2,48 m brut → 2,28 m après dalle isolée", "Mur nord : trace d'humidité ancienne, support sain", "Évacuation existante : insuffisante, station de relevage requise"] },
        { title: "Actions", items: ["Devis traitement humidité à demander d'ici 15 jours", "Plans cotés à finaliser pour la mairie", "Prochaine visite : J+30"] },
      ],
    },
  },
  {
    id: "questions_artisan",
    title: "Liste de questions pour un artisan",
    description: "Les bonnes questions à poser lors d'un rendez-vous.",
    icon: MessagesSquare,
    response: {
      heading: "Questions à poser à un artisan plombier",
      sections: [
        { title: "Faisabilité", items: ["Quelle station de relevage recommandez-vous pour WC + douche ?", "Quel niveau sonore en fonctionnement ?", "Quel entretien annuel prévoir ?"] },
        { title: "Mise en œuvre", items: ["Comment gérez-vous le passage des canalisations en sous-sol ?", "Quels matériaux pour les évacuations (PVC, PER) ?", "Prévoyez-vous un clapet anti-retour ?"] },
        { title: "Engagement", items: ["Délais d'intervention ?", "Garanties proposées (décennale, biennale) ?", "Modalités de paiement et acompte ?"] },
      ],
    },
  },
  {
    id: "synthese",
    title: "Dossier de synthèse projet",
    description: "Génère une synthèse claire à partager avec un tiers (banque, mairie…).",
    icon: FolderArchive,
    response: {
      heading: "Synthèse projet — Aménagement sous-sol",
      sections: [
        { title: "Projet", items: ["Aménagement d'un sous-sol semi-enterré de 35 m² en pièce habitable", "Budget cible : 30 000 € · démarrage prévu mars 2026"] },
        { title: "Lots clés", items: ["Étude de sol G2 (validée)", "Maçonnerie + décaissement (devis reçu)", "Traitement humidité, plomberie, station de relevage (à chiffrer)"] },
        { title: "Risques identifiés", items: ["Humidité — point critique", "Hauteur sous plafond limite", "Dépassement potentiel du budget maçonnerie"] },
      ],
    },
  },
];

function CopilotPage() {
  const [active, setActive] = useState<ActionId | null>(null);
  const [loading, setLoading] = useState(false);

  const action = active ? ACTIONS.find((a) => a.id === active)! : null;

  const run = (id: ActionId) => {
    setLoading(true);
    setActive(id);
    setTimeout(() => setLoading(false), 700);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Copilote IA"
        description="Votre assistant pour analyser, structurer et préparer chaque étape du chantier."
      />

      <Card className="border-primary/30 bg-primary/5 shadow-sm">
        <CardContent className="flex items-start gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Démonstration MVP</p>
            <p className="text-muted-foreground">
              Les réponses sont simulées pour cette version. La connexion à un vrai moteur IA
              arrivera dans une prochaine itération.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIONS.map((a) => {
          const Icon = a.icon;
          const isActive = active === a.id;
          return (
            <button
              key={a.id}
              onClick={() => run(a.id)}
              className={`group rounded-xl border p-4 text-left transition-colors ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-border/60 bg-card hover:border-primary/40 hover:bg-secondary/40"
              }`}
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{a.description}</p>
            </button>
          );
        })}
      </div>

      {action && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              {action.response.heading}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Le copilote analyse votre projet…
              </div>
            ) : (
              <div className="space-y-5">
                {action.response.sections.map((s, i) => (
                  <div key={i}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{s.title}</p>
                    <ul className="space-y-1.5">
                      {s.items.map((it, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
                  <Button size="sm" variant="outline" disabled>Copier</Button>
                  <Button size="sm" variant="outline" disabled>Envoyer par email</Button>
                  <Button size="sm" variant="outline" disabled>Ajouter aux notes</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
