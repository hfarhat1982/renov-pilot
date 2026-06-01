import { createFileRoute, redirect } from "@tanstack/react-router";
import { resolveActiveProject } from "@/lib/services/projects";
import { NoProjectState } from "@/components/NoProjectState";

export const Route = createFileRoute("/_app/notes")({
  loader: async () => {
    const project = await resolveActiveProject();
    if (project) throw redirect({ to: "/projets/$id/journal", params: { id: project.id } });
    return {};
  },
  component: NoProjectState,
});
