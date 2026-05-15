import AppShell from "../../components/layout/AppShell";
import StatCard from "../../components/dashboard/StatCard";
import TaskTable from "../../components/dashboard/TaskTable";
import ProjectGrid from "../../components/dashboard/ProjectGrid";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import { headers } from "next/headers";

type ApiProject = {
  _id: string;
  name: string;
  description?: string;
  userRole?: "ADMIN" | "MEMBER";
};

type ApiTask = {
  _id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
  dueDate?: string;
  projectId?: { _id: string; name: string } | string;
};

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

export default async function DashboardPage() {
  let tasksData: { tasks: ApiTask[] } = { tasks: [] };
  let projectsData: { projects: ApiProject[] } = { projects: [] };
  let nowMs: number | null = null;

  try {
    const headerList = await headers();
    const host =
      headerList.get("x-forwarded-host") ??
      headerList.get("host") ??
      "localhost:3000";
    const proto = headerList.get("x-forwarded-proto") ?? "http";
    const baseUrl = process.env.NEXTAUTH_URL ?? `${proto}://${host}`;
    const cookie = headerList.get("cookie") ?? "";
    const nowHeader = headerList.get("date");

    const [tasksRes, projectsRes] = await Promise.all([
      fetch(`${baseUrl}/api/tasks`, { cache: "no-store", headers: { cookie } }),
      fetch(`${baseUrl}/api/projects`, { cache: "no-store", headers: { cookie } }),
    ]);

    const responseNowHeader =
      tasksRes.headers.get("date") ?? projectsRes.headers.get("date") ?? nowHeader;
    if (responseNowHeader) {
      const parsedNowMs = Date.parse(responseNowHeader);
      nowMs = Number.isNaN(parsedNowMs) ? null : parsedNowMs;
    }

    tasksData = tasksRes.ok ? await tasksRes.json() : { tasks: [] };
    projectsData = projectsRes.ok ? await projectsRes.json() : { projects: [] };
  } catch {
    tasksData = { tasks: [] };
    projectsData = { projects: [] };
  }

  const tasks: ApiTask[] = Array.isArray(tasksData.tasks) ? tasksData.tasks : [];
  const projects: ApiProject[] = Array.isArray(projectsData.projects) ? projectsData.projects : [];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate || nowMs === null) return false;
    return t.status !== "DONE" && new Date(t.dueDate).getTime() < nowMs;
  }).length;

  const stats = [
    { label: "Total tasks", value: `${totalTasks}`, delta: "Updated", tone: "amber" as const },
    { label: "Completed", value: `${completedTasks}`, delta: "Updated", tone: "emerald" as const },
    { label: "Overdue", value: `${overdueTasks}`, delta: "Updated", tone: "blue" as const },
  ];

  const normalizedTasks = tasks.map((task) => {
    // ✅ FIX: .title → .name
    const projectName =
      typeof task.projectId === "object" && task.projectId
        ? task.projectId.name
        : "Unassigned";
    return {
      id: task._id,
      title: task.title,
      project: projectName,
      status: task.status,
      priority: task.priority,
      due: formatDate(task.dueDate),
    };
  });

  const normalizedProjects = projects.map((p) => ({
    id: p._id,
    name: p.name,
    description: p.description,
    progress: undefined,
    userRole: p.userRole,
  }));

  return (
    <AppShell
      title="Dashboard"
      subtitle="Overview of workload, risks, and delivery momentum."
    >
      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr] min-w-0">
        <TaskTable tasks={normalizedTasks} />
        <ActivityFeed items={[]} />
      </section>

      <section>
        <ProjectGrid projects={normalizedProjects} />
      </section>
    </AppShell>
  );
}
