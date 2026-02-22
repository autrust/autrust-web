"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type OpenChatContextValue = {
  open: boolean;
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void;
};

const OpenChatContext = createContext<OpenChatContextValue | null>(null);

export function OpenChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <OpenChatContext.Provider value={{ open, setOpen }}>
      {children}
    </OpenChatContext.Provider>
  );
}

export function useOpenChat(): OpenChatContextValue {
  const ctx = useContext(OpenChatContext);
  if (!ctx) {
    throw new Error("useOpenChat must be used within OpenChatProvider");
  }
  return ctx;
}
