const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Projects", href: "/projects" },
    { label: "Tasks", href: "/dashboard#tasks" },
    // { label: "Insights", href: "/dashboard#insights" },
];

export default function Sidebar() {
    return (
        <aside className="hidden h-fit flex-col gap-4 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm md:flex">
            <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-500 text-white font-semibold">
                    T
                </div>
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">TaskFlow</p>
                    <p className="text-lg font-semibold text-zinc-900">Project Ops</p>
                </div>
            </div>
            <nav className="mt-4 space-y-2">
                {navItems.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className="flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-sm font-medium text-zinc-700 transition hover:border-zinc-200 hover:bg-zinc-50"
                    >
                        <span>{item.label}</span>
                        <span className="text-xs text-zinc-400">→</span>
                    </a>
                ))}
            </nav>
            {/* <div className="mt-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-600">
                <p className="font-medium text-zinc-800">Team pulse</p>
                <p className="mt-1 text-xs leading-relaxed">
                    4 projects active, 12 tasks at risk. Review the weekly checkpoint.
                </p>
                <button className="mt-3 w-full rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white">
                    View report
                </button>
            </div> */}
        </aside>
    );
}
