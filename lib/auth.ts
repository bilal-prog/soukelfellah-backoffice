"use client";

import type { User } from "@/lib/types";

const USER_KEY = "soukelfellah_user";

export function saveClientUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getClientUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function clearClientUser() {
  localStorage.removeItem(USER_KEY);
}
