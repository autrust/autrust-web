"use client";

import { usePathname } from "next/navigation";

export function LayoutSwitcher({
  children,
  introTop,
  introBottom,
  defaultTop,
  defaultBottom,
}: {
  children: React.ReactNode;
  introTop: React.ReactNode;
  introBottom: React.ReactNode;
  defaultTop: React.ReactNode;
  defaultBottom: React.ReactNode;
}) {
  const pathname = usePathname();
  const isIntro = pathname === "/";

  if (isIntro) {
    return (
      <div className="min-h-screen bg-[#05070c] text-white">
        {introTop}
        {children}
        {introBottom}
      </div>
    );
  }

  return (
    <>
      {defaultTop}
      {children}
      {defaultBottom}
    </>
  );
}
