"use client";

// ✅ Client component — "New project" button modal open kar sake

import { useState } from "react";
import CreateProjectModal from "../projects/CreateProjectModal";

interface ProjectCard {
  id: string;
  name: string;           // ✅ name (not title)
  description?: string;
  progress?: number;
  userRole?: "ADMIN" | "MEMBER";
}

interface ProjectGridProps {
  projects: ProjectCard[];
}

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Projects
            </p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-900">
              Recent workspaces
            </h2>
          </div>
          {/* ✅ onClick connected now */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 sm:w-auto"
          >
            + New project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-white/70 p-6 text-center text-sm text-zinc-500">
            No projects yet. Create a project to see progress here.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {projects.map((project) => (
              <a
                key={project.id}
                href={`/projects/${project.id}`}
                className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4 transition hover:border-orange-200 hover:bg-orange-50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    {/* ✅ project.name */}
                    <p className="text-sm font-semibold text-zinc-900">
                      {project.name}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {project.description || "No description added."}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${project.userRole === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-zinc-100 text-zinc-500"
                      }`}
                  >
                    {project.userRole ?? "MEMBER"}
                  </span>
                </div>
                <div className="mt-4 h-1.5 w-full rounded-full bg-zinc-200">
                  <div
                    className="h-1.5 rounded-full bg-orange-400"
                    style={{ width: `${project.progress ?? 0}%` }}
                  />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}