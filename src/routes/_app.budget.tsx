import { createFileRoute, redirect } from "@tanstack/react-router";
import { resolveActiveProject } from "@/lib/services/projects";
import { NoProjectState } from "@/components/NoProjectState";

export const Route = createFileRoute("/_app/budget")({
  loader: async () => {
    const project = await resolveActiveProject();
    if (project) throw redirect({ to: "/projets/$id/budget", params: { id: project.id } });
    return {};
  },
  component: NoProjectState,
});
