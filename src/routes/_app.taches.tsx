import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriorityBadge, TaskStatusBadge } from "@/components/StatusBadges";
import { Calendar, User } from "lucide-react";
import { formatDate, type TaskStatus } from "@/lib/mockData";
import { resolveActiveProject } from "@/lib/services/projects";
import { getTasksByProject } from "@/lib/services/tasks";
import { getLotsByProject } from "@/lib/services/lots";
import { NoProjectState } from "@/components/NoProjectState";

export const Route = createFileRoute("/_app/taches")({
  head: () => ({ meta: [{ title: "Tâches — RenoV Pilot" }] }),
  loader: async () => {
    const project = await resolveActiveProject();
    if (!project) return { noProject: true as const };
    const [tasks, lots] = await Promise.all([
      getTasksByProject(project.id),
      getLotsByProject(project.id),
    ]);
    return { noProject: false as const, tasks, lots };
  },
  component: TasksPage,
});

function TasksPage() {
  const data = Route.useLoaderData();
  if (data.noProject) return <NoProjectState />;
  const { tasks, lots } = data;

  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | TaskStatus>("all");

  const filtered = useMemo(() => {
    return tasks
      .filter((t) => (tab === "all" ? true : t.status === tab))
      .filter((t) => t.title.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks, q, tab]);

  const lotName = (id: string | null) => (id ? (lots.find((l) => l.id === id)?.name ?? "—") : "—");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tâches"
        description="Toutes les actions concrètes à mener pour faire avancer le projet."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="a_faire">À faire</TabsTrigger>
            <TabsTrigger value="en_cours">En cours</TabsTrigger>
            <TabsTrigger value="termine">Terminé</TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          placeholder="Rechercher…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:max-w-xs"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((t) => (
          <Card key={t.id} className="border-border/60 shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p className="font-medium leading-snug">{t.title}</p>
                <p className="text-xs text-muted-foreground">Lot : {lotName(t.lotId)}</p>
                {t.notes && <p className="text-xs text-muted-foreground">{t.notes}</p>}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(t.dueDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {t.owner}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <PriorityBadge priority={t.priority} />
                <TaskStatusBadge status={t.status} />
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {tasks.length === 0 ? "Aucune tâche pour ce projet." : "Aucune tâche pour ce filtre."}
          </p>
        )}
      </div>
    </div>
  );
}
