"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError("");

        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        if (!response.ok) {
            const data = await response.json();
            setError(data.error || "Unable to create account");
            setLoading(false);
            return;
        }

        router.push("/login");
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff,#f2ece3,#f7f4ef)] px-4 py-12">
            <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-lg">
                    <h2 className="text-xl font-semibold text-zinc-900">Create your account</h2>
                    <p className="mt-2 text-sm text-zinc-500">
                        Start organizing projects in minutes.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <label className="block text-sm font-medium text-zinc-700">
                            Full name
                            <input
                                type="text"
                                value={name}
                                onChange={(event) => setName(event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 focus:border-orange-300 focus:outline-none"
                                placeholder="Riya Sharma"
                                required
                            />
                        </label>

                        <label className="block text-sm font-medium text-zinc-700">
                            Email
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 focus:border-orange-300 focus:outline-none"
                                placeholder="name@company.com"
                                required
                            />
                        </label>

                        <label className="block text-sm font-medium text-zinc-700">
                            Password
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-800 focus:border-orange-300 focus:outline-none"
                                placeholder="Create a strong password"
                                required
                            />
                        </label>

                        {error ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                                {error}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-full bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                        >
                            {loading ? "Creating..." : "Create account"}
                        </button>

                        <div className="text-center text-xs text-zinc-500">
                            Already have an account?{" "}
                            <a className="font-semibold text-zinc-900" href="/login">
                                Sign in
                            </a>
                        </div>
                    </form>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Why TaskFlow</p>
                    <h1 className="mt-3 text-3xl font-semibold text-zinc-900">
                        One view for projects, people, and priorities.
                    </h1>
                    <p className="mt-3 text-sm text-zinc-500">
                        Keep milestones aligned, track outcomes, and move from idea to delivery with clarity.
                    </p>
                    <div className="mt-8 space-y-4 text-sm text-zinc-600">
                        {[
                            "Personalized dashboards for every role",
                            "Automated status updates and alerts",
                            "Weekly checkpoints and executive summaries",
                        ].map((item) => (
                            <div key={item} className="rounded-2xl border border-zinc-100 bg-zinc-50 px-4 py-3">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
