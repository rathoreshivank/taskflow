"use client";

import { signOut, useSession } from "next-auth/react";

function getInitials(name: string | null, email: string | null) {
    if (name?.trim()) {
        return name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? "")
            .join("");
    }

    if (email?.trim()) {
        return email.trim()[0]?.toUpperCase() ?? "U";
    }

    return "TF";
}

export default function UserMenu() {
    const { data: session, status } = useSession();
    const name = session?.user?.name ?? null;
    const email = session?.user?.email ?? null;
    const displayName = name?.trim() || "User";
    const initials = getInitials(name, email);
    const isAuthenticated = status === "authenticated";

    if (!isAuthenticated) {
        return null;
    }

    return (
        <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-full border border-zinc-200 bg-white px-2 py-2 text-left shadow-sm transition hover:border-zinc-300">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                    {initials}
                </div>
                <div className="hidden min-w-0 sm:block">
                    <p className="truncate text-sm font-semibold text-zinc-900">{displayName}</p>
                    <p className="truncate text-xs text-zinc-500">{email ?? "No email available"}</p>
                </div>
            </summary>

            <div className="absolute right-0 top-[calc(100%+0.75rem)] w-72 rounded-3xl border border-zinc-200 bg-white p-4 shadow-xl">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Signed in as</p>
                <p className="mt-3 text-sm font-semibold text-zinc-900">{displayName}</p>
                <p className="mt-1 break-all text-sm text-zinc-500">{email ?? "No email available"}</p>

                <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="mt-4 w-full rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50"
                >
                    Logout
                </button>
            </div>
        </details>
    );
}
