interface ActivityItem {
    id: string;
    title: string;
    detail: string;
    time: string;
}

interface ActivityFeedProps {
    items: ActivityItem[];
}

export default function ActivityFeed({ items }: ActivityFeedProps) {
    return (
        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-6 shadow-sm" id="insights">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Activity</p>
                    <h2 className="mt-2 text-xl font-semibold text-zinc-900">Team pulse</h2>
                </div>
                <span className="text-xs text-zinc-500">Updated just now</span>
            </div>
            {items.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-zinc-200 bg-white/70 p-6 text-center text-sm text-zinc-500">
                    No activity yet. Updates will appear as your team works.
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                                    <p className="mt-1 text-xs text-zinc-500">{item.detail}</p>
                                </div>
                                <span className="text-xs text-zinc-400">{item.time}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
