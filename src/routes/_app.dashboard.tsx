import { createFileRoute, redirect } from "@tanstack/react-router";
import { resolveActiveProject } from "@/lib/services/projects";
import { NoProjectState } from "@/components/NoProjectState";
import { FormCreateProject } from "@/components/forms/FormCreateProject";

export const Route = createFileRoute("/_app/dashboard")({
  loader: async () => {
    const project = await resolveActiveProject();
    if (project) throw redirect({ to: "/projets/$id/dashboard", params: { id: project.id } });
    return { hasProject: false };
  },
  component: () => {
    const { hasProject } = Route.useLoaderData();
    return hasProject ? null : <><NoProjectState /><FormCreateProject /></>;
  },
});
