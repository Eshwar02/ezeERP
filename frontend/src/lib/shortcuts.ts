import { GLOBAL_SHORTCUTS } from "./keymap";

// Derived from the keymap registry so the dashboard list can never drift from
// the keys that actually fire. Shape kept as [combo, label] for the dashboard UI.
export const shortcuts: [string, string][] = GLOBAL_SHORTCUTS.map((s) => [s.combo, s.label]);
