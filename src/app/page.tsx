export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-[radial-gradient(circle_at_top,#fff,#f3ede4,#f7f4ef)]">
      <div className="absolute -left-32 top-24 h-64 w-64 rounded-full bg-orange-200/50 blur-3xl" />
      <div className="absolute -right-32 bottom-24 h-64 w-64 rounded-full bg-blue-200/50 blur-3xl" />
      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-5 py-12 sm:gap-16 sm:px-6 sm:py-16">
        <header className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-orange-500 text-white grid place-items-center font-semibold">T</div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">TaskFlow</p>
                <p className="text-lg font-semibold">Project Ops Suite</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a className="rounded-full border border-zinc-200 px-4 py-2 text-center text-sm font-medium text-zinc-600 hover:text-zinc-900" href="/login">Login</a>
              <a className="rounded-full bg-zinc-900 px-4 py-2 text-center text-sm font-medium text-white" href="/signup">Get started</a>
            </div>
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div className="space-y-6">
              <h1 className="text-3xl font-semibold leading-tight text-zinc-900 sm:text-5xl">
                Plan boldly, ship faster, and keep every task visible.
              </h1>
              <p className="max-w-xl text-base text-zinc-600 sm:text-lg">
                TaskFlow gives teams a focused project workspace with live status, ownership, and deadlines — all in one clean dashboard.
              </p>
            </div>
            <div className="rounded-3xl border border-zinc-200 bg-white/80 p-5 shadow-xl sm:p-6">
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Team health</span>
                <span>Last 7 days</span>
              </div>
              <div className="mt-6 space-y-4">
                {[
                  { label: "Project velocity", value: "78%" },
                  { label: "Tasks closed", value: "42" },
                  { label: "On-time delivery", value: "91%" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
                    <p className="text-sm text-zinc-600">{item.label}</p>
                    <p className="text-lg font-semibold text-zinc-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Instant clarity",
              text: "Live dashboards surface owners, blockers, and risks without hunting across tools.",
            },
            {
              title: "Smart routines",
              text: "Create project playbooks that keep onboarding, handoffs, and reviews consistent.",
            },
            {
              title: "Focused momentum",
              text: "Plan sprints, track priorities, and keep every stakeholder aligned.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-zinc-900">{card.title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{card.text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
