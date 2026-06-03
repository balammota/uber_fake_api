"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { UBER_PORTAL_USERS } from "@/lib/uber-portal-constants";
import { useUberPortal } from "../UberPortalProvider";

export default function UberPortalLoginPage() {
  const router = useRouter();
  const { setUser } = useUberPortal();

  function enterAs(user) {
    setUser(user);
    router.push("/telematics/uber");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="rounded-xl border border-[#222222] bg-[#111111] p-8">
          <div className="text-center">
            <p className="text-3xl font-bold text-white">Uber</p>
            <h1 className="mt-4 text-xl font-bold text-white">Uber Telematics — Internal Portal</h1>
            <p className="mt-2 text-sm text-zinc-500">Partner & System Management</p>
          </div>

          <div className="mt-8 space-y-3" data-tour="uber-login-users">
            {UBER_PORTAL_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => enterAs(user)}
                className="flex w-full items-center gap-4 rounded-lg border border-[#222222] p-4 text-left transition-colors hover:border-zinc-600 hover:bg-zinc-900/50"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white ring-1 ring-zinc-700">
                  {user.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-white">{user.name}</span>
                  <span className="block text-sm text-zinc-400">{user.role}</span>
                  <span className="mt-1 block text-sm text-zinc-500">{user.description}</span>
                  <span className="mt-2 block text-sm font-medium text-white">
                    Enter as {user.name.split(" ")[0]} →
                  </span>
                </span>
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-zinc-600">
            Internal use only — Uber Telematics API v1.0
          </p>
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/telematics" className="text-zinc-500 hover:text-white">
            ← Back to Platform
          </Link>
        </p>
      </div>
    </div>
  );
}
