"use client";

import { useState } from "react";
import { ReportProblemForm } from "./ReportProblemForm";

type ReportProblemButtonProps = {
  label?: string;
  className?: string;
};

export function ReportProblemButton({ label = "Aide", className }: ReportProblemButtonProps) {
  const [open, setOpen] = useState(false);
  const buttonClass =
    className ??
    "text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClass}
      >
        {label}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900">Envoyer un message à l&apos;équipe</h3>
            <p className="mt-1 text-sm text-slate-600">
              Décrivez votre demande ou le problème rencontré. L&apos;administrateur le recevra et vous recontactera si besoin.
            </p>
            <div className="mt-4">
              <ReportProblemForm
                pageUrl={typeof window !== "undefined" ? window.location.href : undefined}
                onClose={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
