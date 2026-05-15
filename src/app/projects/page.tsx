// ✅ Server Component — data fetch karta hai
// Modal state → ProjectsClient (Client Component) mein hai

import AppShell from "../../components/layout/AppShell";
import ProjectsClient from "../../components/projects/ProjectsClient";
import { headers } from "next/headers";

type ApiProject = {
    _id: string;
    name: string;
    description?: string;
    userRole?: "ADMIN" | "MEMBER";
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

export default async function ProjectsPage() {
    let projects: ApiProject[] = [];

    try {
        const baseUrl = await getBaseUrl();
        const headerList = await headers();
        const cookie = headerList.get("cookie") ?? "";

        const res = await fetch(`${baseUrl}/api/projects`, {
            cache: "no-store",
            headers: { cookie },
        });

        const data = res.ok ? await res.json() : { projects: [] };
        projects = Array.isArray(data.projects) ? data.projects : [];
    } catch {
        projects = [];
    }

    return (
        <AppShell
            title="Projects"
            subtitle="Track ownership, milestones, and delivery confidence."
        >

            <ProjectsClient projects={projects} />
        </AppShell>
    );
}