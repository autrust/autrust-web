"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { LoginForm } from "@/app/login/LoginForm";
import { RegisterForm } from "@/app/register/RegisterForm";

type Tab = "login" | "signup";

export function AuthTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") === "signup" ? "signup" : "login") as Tab;
  const next = searchParams.get("next") ?? undefined;

  const redirectTo = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";

  const setTab = useCallback(
    (newTab: Tab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", newTab);
      if (next) params.set("next", next);
      router.replace(`/auth?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, next]
  );

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/75 p-6 shadow-sm backdrop-blur">
      <div className="flex rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            tab === "signup"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Créer un compte
        </button>
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
            tab === "login"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Se connecter
        </button>
      </div>

      <div className="mt-6">
        {tab === "login" ? (
          <LoginForm redirectTo={redirectTo} />
        ) : (
          <RegisterForm redirectTo={redirectTo} />
        )}
      </div>
    </div>
  );
}
