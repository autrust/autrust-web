"use client";

import { useEffect } from "react";

const STORAGE_KEY = "autrust-recent-listings";
const MAX_RECENT = 10;

export function RecentlyViewedTracker({ listingId }: { listingId: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const next = [listingId, ...ids.filter((id) => id !== listingId)].slice(0, MAX_RECENT);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [listingId]);
  return null;
}

export function getRecentListingIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
