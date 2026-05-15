interface StatCardProps {
    label: string;
    value: string;
    delta: string;
    tone?: "amber" | "blue" | "emerald";
}

const toneMap = {
    amber: "bg-orange-50 text-orange-600 border-orange-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
};

export default function StatCard({ label, value, delta, tone = "amber" }: StatCardProps) {
    return (
        <div className="rounded-3xl border border-zinc-200 bg-white/90 p-5 shadow-sm sm:p-6">
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">{label}</p>
            <div className="mt-4 flex items-center justify-between">
                <p className="text-2xl font-semibold text-zinc-900 sm:text-3xl">{value}</p>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${toneMap[tone]}`}>
                    {delta}
                </span>
            </div>
        </div>
    );
}
