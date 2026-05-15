"use client";

import { useState } from "react";
import CreateProjectModal from "../projects/CreateProjectModal";

type ApiProject = {
  _id: string;
  name: string;
  description?: string;
  userRole?: "ADMIN" | "MEMBER";
};

type ProjectsClientProps = {
  projects: ApiProject[];
};

export default function ProjectsClient({ projects }: ProjectsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* ✅ Modal — state yahan manage hoti hai */}
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm">
        {/* Header with working button */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">
              Portfolio
            </p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-900">
              Active projects
            </h2>
          </div>
          {/* ✅ onClick connected — button actually works ab */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition"
          >
            + New project
          </button>
        </div>

        {/* Projects list */}
        {projects.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-zinc-200 bg-white/70 p-8 text-center">
            <p className="text-lg font-semibold text-zinc-900">
              No projects yet
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Create your first project to start tracking tasks and milestones.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 rounded-full bg-zinc-900 px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
            >
              Create project
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <a
                key={project._id}
                href={`/projects/${project._id}`}
                className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5 transition hover:border-orange-200 hover:bg-orange-50"
              >
                <div className="flex items-center justify-between">
                  {/* ✅ project.name (not project.title) */}
                  <h3 className="text-lg font-semibold text-zinc-900">
                    {project.name}
                  </h3>
                  {/* ✅ Role badge */}
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      project.userRole === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {project.userRole ?? "MEMBER"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  {project.description || "No description added yet."}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-zinc-400">
                  <span>Click to view tasks</span>
                  <span className="font-semibold text-orange-600">
                    Open →
                  </span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}