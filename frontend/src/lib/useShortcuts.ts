"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "./api";
import { useActionBus } from "./actionBus";
import { GLOBAL_SHORTCUTS, matches, sectionFor, type Shortcut } from "./keymap";

// Keyboard-first navigation (PDF Section 15). Both global shortcuts and the
// current section's shortcuts are resolved from the keymap registry, so what the
// ShortcutPanel shows is exactly what fires here.
export function useShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const bus = useActionBus();

  useEffect(() => {
    const section = sectionFor(pathname);
    // Section shortcuts take priority over globals on key conflicts.
    const active: Shortcut[] = [...(section?.shortcuts ?? []), ...GLOBAL_SHORTCUTS];

    function fire(e: KeyboardEvent, s: Shortcut) {
      e.preventDefault();
      if (s.kind === "nav") {
        router.push(s.href);
      } else if (s.kind === "action") {
        if (s.action === "logout") {
          logout();
          router.push("/login");
        } else {
          bus.run(s.action);
        }
      }
    }

    function onKey(e: KeyboardEvent) {
      // Let plain typing in inputs pass through; only intercept on a modifier
      // or a function key so field entry is never hijacked.
      const isFn = /^F\d{1,2}$/.test(e.key);
      const hasMod = e.ctrlKey || e.metaKey || e.altKey;
      if (!isFn && !hasMod) return;

      for (const s of active) {
        if (matches(e, s)) return fire(e, s);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, pathname, bus]);
}
