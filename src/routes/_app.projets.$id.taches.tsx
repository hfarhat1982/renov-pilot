import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PriorityBadge, TaskStatusBadge } from "@/components/StatusBadges";
import { Calendar, Plus, User } from "lucide-react";
import { formatDate, type TaskStatus } from "@/lib/mockData";
import { getProjectById } from "@/lib/services/projects";
import { getTasksByProject } from "@/lib/services/tasks";
import { getLotsByProject } from "@/lib/services/lots";
import { FormAddTask } from "@/components/forms/FormAddTask";
import type { Task, Lot } from "@/lib/types";

export const Route = createFileRoute("/_app/projets/$id/taches")({
  head: () => ({ meta: [{ title: "Tâches — RenoV Pilot" }] }),
  component: TasksPage,
});

const Spinner = () => (
  <div className="flex min-h-[40vh] items-center justify-center">
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

type Data = { tasks: Task[]; lots: Lot[] };

function TasksPage() {
  const { id } = Route.useParams();
  const [data, setData] = useState<Data | null | "not-found">(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | TaskStatus>("all");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProjectById(id).then(async (project) => {
      if (cancelled) return;
      if (!project) { setData("not-found"); return; }
      const [tasks, lots] = await Promise.all([getTasksByProject(project.id), getLotsByProject(project.id)]);
      if (!cancelled) setData({ tasks, lots });
    });
    return () => { cancelled = true; };
  }, [id]);

  const filtered = useMemo(() => {
    if (!data || data === "not-found") return [];
    return data.tasks
      .filter((t) => (tab === "all" ? true : t.status === tab))
      .filter((t) => t.title.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [data, q, tab]);

  if (data === "not-found") return <div className="py-12 text-center text-muted-foreground">Projet introuvable.</div>;
  if (!data) return <Spinner />;

  const { tasks, lots } = data;
  const lotName = (lotId: string | null) => lotId ? (lots.find((l) => l.id === lotId)?.name ?? "—") : "—";

  return (
    <div className="space-y-6">
      <PageHeader title="Tâches" description="Toutes les actions concrètes à mener pour faire avancer le projet." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="a_faire">À faire</TabsTrigger>
            <TabsTrigger value="en_cours">En cours</TabsTrigger>
            <TabsTrigger value="termine">Terminé</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2">
          <Input placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} className="sm:max-w-xs" />
          <Button onClick={() => setShowForm(true)} className="shrink-0">
            <Plus className="h-4 w-4 mr-1" />
            Ajouter une tâche
          </Button>
        </div>
      </div>

      <FormAddTask
        open={showForm}
        onOpenChange={setShowForm}
        projectId={id}
        lots={lots}
        onCreated={(task) =>
          setData((prev) =>
            prev && prev !== "not-found" ? { ...prev, tasks: [task, ...prev.tasks] } : prev
          )
        }
      />

      <div className="space-y-3">
        {filtered.map((t) => (
          <Card key={t.id} className="border-border/60 shadow-sm">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-1">
                <p className="font-medium leading-snug">{t.title}</p>
                <p className="text-xs text-muted-foreground">Lot : {lotName(t.lotId)}</p>
                {t.notes && <p className="text-xs text-muted-foreground">{t.notes}</p>}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(t.dueDate)}</span>
                  <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{t.owner}</span>
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
