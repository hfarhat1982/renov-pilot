import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/StatusBadges";
import { AlertTriangle, CheckCircle2, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate, notes, type Note } from "@/lib/mockData";

export const Route = createFileRoute("/_app/notes")({
  head: () => ({ meta: [{ title: "Notes & décisions — RenoV Pilot" }] }),
  component: NotesPage,
});

const typeMeta: Record<Note["type"], { label: string; tone: "info" | "warning" | "danger" | "success"; icon: typeof StickyNote }> = {
  decision: { label: "Décision", tone: "success", icon: CheckCircle2 },
  note: { label: "Note", tone: "info", icon: StickyNote },
  alerte: { label: "Alerte", tone: "danger", icon: AlertTriangle },
};

function NotesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Notes & décisions" description="Gardez la mémoire du projet : décisions clés, alertes terrain, notes utiles." />

      <div className="space-y-3">
        {notes
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .map((n) => {
            const meta = typeMeta[n.type];
            const Icon = meta.icon;
            return (
              <Card key={n.id} className="border-border/60 shadow-sm">
                <CardContent className="flex items-start gap-3 p-4">
                  <div className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                    n.type === "decision" && "bg-success/15 text-success",
                    n.type === "note" && "bg-info/15 text-info",
                    n.type === "alerte" && "bg-destructive/15 text-destructive",
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      <StatusPill tone={meta.tone}>{meta.label}</StatusPill>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.body}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(n.date)} · {n.author}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
