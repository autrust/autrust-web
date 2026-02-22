"use client";

import { useOpenChat } from "./OpenChatContext";
import { ReportProblemButton } from "./ReportProblemButton";

const navLinkClass =
  "rounded-xl px-3 py-2 text-sky-700 hover:bg-sky-50/80 hover:text-sky-800 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60";

type HeaderHelpLinksProps = {
  labelAide: string;
  labelChat: string;
};

export function HeaderHelpLinks({ labelAide, labelChat }: HeaderHelpLinksProps) {
  const { setOpen } = useOpenChat();

  return (
    <>
      <ReportProblemButton
        label={labelAide}
        className={navLinkClass}
      />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={navLinkClass}
      >
        {labelChat}
      </button>
    </>
  );
}
