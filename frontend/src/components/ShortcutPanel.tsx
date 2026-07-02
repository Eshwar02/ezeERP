"use client";
import { usePathname } from "next/navigation";
import { GLOBAL_SHORTCUTS, sectionFor, type Shortcut } from "@/lib/keymap";

function Row({ s }: { s: Shortcut }) {
  return (
    <li className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-slate-600">{s.label}</span>
      <span className="kbd shrink-0">{s.combo}</span>
    </li>
  );
}

// Fixed right rail showing the shortcuts for the current section plus the global
// ones. Reads the same registry the keydown handler uses, so it is always in sync.
export function ShortcutPanel() {
  const pathname = usePathname();
  const section = sectionFor(pathname);

  return (
    <aside className="hidden w-72 shrink-0 border-l border-slate-200 bg-white xl:block">
      <div className="sticky top-0 max-h-screen overflow-y-auto p-5">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Shortcuts</p>
          <h2 className="mt-0.5 text-base font-bold text-slate-800">
            {section ? section.title : "Gateway"}
          </h2>
        </div>

        {section && section.shortcuts.length > 0 ? (
          <ul className="mb-6 divide-y divide-slate-100">
            {section.shortcuts.map((s) => (
              <Row key={s.combo + s.label} s={s} />
            ))}
          </ul>
        ) : (
          <p className="mb-6 text-sm text-slate-400">
            No section actions here. Use the global keys below to move around.
          </p>
        )}

        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-slate-400">Global</p>
        <ul className="divide-y divide-slate-100">
          {GLOBAL_SHORTCUTS.map((s) => (
            <Row key={s.combo + s.label} s={s} />
          ))}
        </ul>
      </div>
    </aside>
  );
}
