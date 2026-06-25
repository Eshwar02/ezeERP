"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { logout } from "./api";

// Tally-style keyboard-only navigation (PDF Section 15).
// Global + module shortcuts wired to router pushes.
export function useShortcuts() {
  const router = useRouter();
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const alt = e.altKey;
      const ctrl = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();

      // Global
      if (e.key === "F1") return go(e, () => router.push("/companies"));
      if (e.key === "F8") return go(e, () => router.push("/vouchers/sales"));
      if (e.key === "F9") return go(e, () => router.push("/vouchers/purchase"));
      if (ctrl && k === "h") return go(e, () => router.push("/dashboard"));
      if (ctrl && k === "q") return go(e, () => { logout(); router.push("/login"); });

      // Masters
      if (alt && k === "l") return go(e, () => router.push("/masters/ledgers"));
      if (alt && k === "s") return go(e, () => router.push("/masters/stock-items"));

      // Billing
      if (ctrl && k === "b") return go(e, () => router.push("/vouchers/sales"));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);
}

function go(e: KeyboardEvent, fn: () => void) {
  e.preventDefault();
  fn();
}
