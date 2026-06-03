"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { STATESAFE_USERS } from "@/lib/statesafe-constants";
import { useStateSafe } from "../StateSafeProvider";

export default function StateSafeLoginPage() {
  const router = useRouter();
  const { setUser } = useStateSafe();

  function enterAs(user) {
    setUser(user);
    router.push("/telematics/insurer");
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF0F2] text-2xl">
              🛡
            </div>
            <h1 className="mt-4 text-2xl font-bold text-[#C8102E]">StateSafe Insurance Portal</h1>
            <p className="mt-2 text-sm text-[#6B7280]">Powered by Uber Telematics API</p>
          </div>

          <div className="mt-8 space-y-3">
            {STATESAFE_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => enterAs(user)}
                className="flex w-full items-center gap-4 rounded-lg border border-[#E5E7EB] p-4 text-left transition-colors hover:border-[#C8102E] hover:bg-[#FFF0F2]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C8102E] text-sm font-bold text-white">
                  {user.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-[#1A1A1A]">{user.name}</span>
                  <span className="block text-sm text-[#C8102E]">{user.role}</span>
                  <span className="mt-1 block text-sm text-[#6B7280]">{user.description}</span>
                  <span className="mt-2 block text-sm font-medium text-[#C8102E]">
                    Enter as {user.name.split(" ")[0]} →
                  </span>
                </span>
              </button>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-[#6B7280]">
            Demo environment — Uber Telematics API Sandbox
          </p>
        </div>

        <p className="mt-6 text-center text-sm">
          <Link href="/telematics" className="text-[#6B7280] hover:text-[#C8102E]">
            ← Back to Platform
          </Link>
        </p>
      </div>
    </div>
  );
}
