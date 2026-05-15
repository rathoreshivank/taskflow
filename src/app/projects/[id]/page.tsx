import { headers } from "next/headers";
import AppShell from "../../../components/layout/AppShell";
import ProjectWorkspace from "../../../components/projects/ProjectWorkspace";
import EmptyState from "../../../components/shared/EmptyState";

type ApiProject = {
  _id: string;
  name: string;
  description?: string;
  userRole?: "ADMIN" | "MEMBER" | null;
  currentUserId: string;
  members: Array<{
    memberId: string;
    role: "ADMIN" | "MEMBER";
    user: {
      _id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  }>;
};

type ApiTask = {
  _id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string | null;
  assignedTo?: {
    _id?: string;
    name?: string;
    email?: string;
  } | null;
};

async function getBaseUrl() {
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ??
    headerList.get("host") ??
    "localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";

  return process.env.NEXTAUTH_URL ?? `${proto}://${host}`;
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let project: ApiProject | null = null;
  let tasks: ApiTask[] = [];

  try {
    const baseUrl = await getBaseUrl();
    const headerList = await headers();
    const cookie = headerList.get("cookie") ?? "";

    const [projectRes, tasksRes] = await Promise.all([
      fetch(`${baseUrl}/api/projects/${id}`, {
        cache: "no-store",
        headers: { cookie },
      }),
      fetch(`${baseUrl}/api/projects/${id}/tasks`, {
        cache: "no-store",
        headers: { cookie },
      }),
    ]);

    const projectData = projectRes.ok ? await projectRes.json() : null;
    const tasksData = tasksRes.ok ? await tasksRes.json() : { tasks: [] };

    project = projectData?.project ?? null;
    tasks = Array.isArray(tasksData.tasks) ? tasksData.tasks : [];
  } catch {
    project = null;
    tasks = [];
  }

  if (!project) {
    return (
      <AppShell title="Project" subtitle="Project details">
        <EmptyState
          title="Project not found"
          description="We could not load this project. Check the URL or create a new project."
          actionLabel="Back to projects"
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={project.name}
      subtitle={project.description || "Manage members and tasks from one place."}
    >
      <ProjectWorkspace project={project} tasks={tasks} />
    </AppShell>
  );
}
