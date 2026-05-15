interface TaskRow {
    id: string;
    title: string;
    project: string;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH";
    due: string;
}

interface TaskTableProps {
    tasks: TaskRow[];
}

const statusStyles: Record<TaskRow["status"], string> = {
    TODO: "bg-orange-50 text-orange-700",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    DONE: "bg-emerald-50 text-emerald-700",
};

export default function TaskTable({ tasks }: TaskTableProps) {
    return (
        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm sm:p-6 min-w-0" id="tasks">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Assigned tasks</p>
                    <h2 className="mt-2 text-xl font-semibold text-zinc-900">This week</h2>
                </div>
                <button className="w-full rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 sm:w-auto">
                    View all
                </button>
            </div>
            {tasks.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-white/70 p-6 text-center text-sm text-zinc-500">
                    No tasks assigned yet. Tasks will appear here once created.
                </div>
            ) : (
                <div className="mt-6 overflow-x-auto rounded-2xl border border-zinc-100">
                    <table className="min-w-[520px] w-full text-left text-sm">
                        <thead className="bg-zinc-50 text-[11px] uppercase tracking-widest text-zinc-400">
                            <tr>
                                <th className="px-3 py-2 sm:px-4 sm:py-3">Task</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3">Project</th>
                                <th className="px-3 py-2 sm:px-4 sm:py-3">Status</th>
                                <th className="hidden px-3 py-2 sm:table-cell sm:px-4 sm:py-3">Priority</th>
                                <th className="hidden px-3 py-2 sm:table-cell sm:px-4 sm:py-3">Due</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {tasks.map((task) => (
                                <tr key={task.id} className="bg-white">
                                    <td className="px-3 py-3 text-sm font-medium leading-snug text-zinc-900 sm:px-4">
                                        {task.title}
                                    </td>
                                    <td className="px-3 py-3 text-xs text-zinc-500 sm:px-4 sm:text-sm">
                                        {task.project}
                                    </td>
                                    <td className="px-3 py-3 sm:px-4">
                                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:text-xs ${statusStyles[task.status]}`}>
                                            {task.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="hidden px-4 py-3 text-zinc-500 sm:table-cell">{task.priority}</td>
                                    <td className="hidden px-4 py-3 text-zinc-500 sm:table-cell">{task.due}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
