"use client";

import ReactMarkdown from "react-markdown";

const contentClass =
  "space-y-4 [&_h1]:text-3xl [&_h1]:sm:text-4xl [&_h1]:font-semibold [&_h1]:text-slate-900 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_p]:text-slate-700 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_li]:text-slate-700 [&_strong]:font-semibold [&_strong]:text-slate-900";

type Props = {
  content: string;
};

export function LegalMarkdown({ content }: Props) {
  return (
    <div className={contentClass}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
