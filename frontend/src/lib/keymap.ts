// Single source of truth for keyboard-first navigation.
// Drives BOTH the keydown handler (useShortcuts) and the right-side ShortcutPanel,
// so the displayed keys can never drift from the keys that actually fire.

export type Mods = { ctrl?: boolean; alt?: boolean; shift?: boolean };

export type Shortcut = Mods & {
  // The physical key. For function keys use "F1".."F12"; otherwise the lowercase
  // value of KeyboardEvent.key (e.g. "h", "s", "enter").
  key: string;
  label: string; // shown in the panel
  combo: string; // human display, e.g. "Ctrl+H"
} & (
  | { kind: "nav"; href: string }
  | { kind: "action"; action: string } // invoked through the action bus
);

export type Section = {
  id: string;
  title: string;
  // Active when the pathname starts with any of these prefixes.
  match: string[];
  shortcuts: Shortcut[];
};

// Always available inside the app shell.
export const GLOBAL_SHORTCUTS: Shortcut[] = [
  { kind: "nav", key: "h", ctrl: true, href: "/dashboard", label: "Dashboard / Gateway", combo: "Ctrl+H" },
  { kind: "nav", key: "F1", href: "/companies", label: "Company Selection", combo: "F1" },
  { kind: "nav", key: "l", alt: true, href: "/masters/ledgers", label: "Ledgers", combo: "Alt+L" },
  { kind: "nav", key: "a", alt: true, href: "/masters/ledgers", label: "Alter Ledger", combo: "Alt+A" },
  { kind: "nav", key: "s", alt: true, href: "/masters/stock-items", label: "Stock Items", combo: "Alt+S" },
  { kind: "nav", key: "g", alt: true, href: "/masters/groups", label: "Groups", combo: "Alt+G" },
  { kind: "nav", key: "u", alt: true, href: "/masters/units", label: "Units", combo: "Alt+U" },
  { kind: "nav", key: "i", ctrl: true, href: "/inventory", label: "Inventory Dashboard", combo: "Ctrl+I" },
  { kind: "nav", key: "F8", href: "/vouchers/sales", label: "Sales Voucher", combo: "F8" },
  { kind: "nav", key: "F9", href: "/vouchers/purchase", label: "Purchase Voucher", combo: "F9" },
  { kind: "nav", key: "F8", alt: true, href: "/vouchers/credit-note", label: "Credit Note", combo: "Alt+F8" },
  { kind: "nav", key: "F9", alt: true, href: "/vouchers/debit-note", label: "Debit Note", combo: "Alt+F9" },
  { kind: "nav", key: "F5", href: "/vouchers/payment", label: "Payment Voucher", combo: "F5" },
  { kind: "nav", key: "F6", href: "/vouchers/receipt", label: "Receipt Voucher", combo: "F6" },
  { kind: "nav", key: "F7", href: "/vouchers/journal", label: "Journal Voucher", combo: "F7" },
  { kind: "nav", key: "F4", href: "/vouchers/contra", label: "Contra Voucher", combo: "F4" },
  { kind: "nav", key: "b", alt: true, href: "/reports/balance-sheet", label: "Balance Sheet", combo: "Alt+B" },
  { kind: "nav", key: "p", alt: true, href: "/reports/profit-loss", label: "Profit & Loss", combo: "Alt+P" },
  { kind: "nav", key: "t", alt: true, href: "/reports/trial-balance", label: "Trial Balance", combo: "Alt+T" },
  { kind: "nav", key: "c", alt: true, href: "/reports/cash-flow", label: "Cash Flow", combo: "Alt+C" },
  { kind: "nav", key: "r", alt: true, href: "/reports/stock-summary", label: "Stock Summary", combo: "Alt+R" },
  { kind: "nav", key: "x", alt: true, href: "/reports/gst", label: "GST Reports", combo: "Alt+X" },
  { kind: "action", key: "q", ctrl: true, action: "logout", label: "Logout", combo: "Ctrl+Q" },
];

// Action IDs forms register on the action bus.
export const ACTIONS = {
  save: "save",
  addLine: "add-line",
  resetForm: "reset-form",
  focusFirst: "focus-first",
} as const;

const SAVE: Shortcut = { kind: "action", key: "s", ctrl: true, action: ACTIONS.save, label: "Save current form", combo: "Ctrl+S" };
const ADD_LINE: Shortcut = { kind: "action", key: "n", alt: true, action: ACTIONS.addLine, label: "Add line / row", combo: "Alt+N" };
const RESET: Shortcut = { kind: "action", key: "r", alt: true, action: ACTIONS.resetForm, label: "Reset form", combo: "Alt+R" };
const FOCUS_FIRST: Shortcut = { kind: "action", key: "i", alt: true, action: ACTIONS.focusFirst, label: "Focus first field", combo: "Alt+I" };

export const SECTIONS: Section[] = [
  {
    id: "masters",
    title: "Masters",
    match: ["/masters/"],
    shortcuts: [SAVE, FOCUS_FIRST, RESET],
  },
  {
    id: "trade-voucher",
    title: "Trade Voucher",
    match: ["/vouchers/sales", "/vouchers/purchase"],
    shortcuts: [SAVE, ADD_LINE, FOCUS_FIRST],
  },
  {
    id: "accounting-voucher",
    title: "Accounting Voucher",
    match: ["/vouchers/payment", "/vouchers/receipt", "/vouchers/journal", "/vouchers/contra"],
    shortcuts: [SAVE, ADD_LINE, FOCUS_FIRST],
  },
  {
    id: "companies",
    title: "Companies",
    match: ["/companies"],
    shortcuts: [SAVE, FOCUS_FIRST],
  },
  {
    id: "inventory",
    title: "Inventory",
    match: ["/inventory"],
    shortcuts: [],
  },
  {
    id: "reports",
    title: "Reports",
    match: ["/reports/"],
    shortcuts: [],
  },
  {
    id: "dashboard",
    title: "Gateway",
    match: ["/dashboard"],
    shortcuts: [],
  },
];

export function sectionFor(pathname: string): Section | null {
  return SECTIONS.find((s) => s.match.some((m) => pathname.startsWith(m))) ?? null;
}

// Strict modifier match: every modifier must equal the event's state, so Alt+L
// never fires on Ctrl+Alt+L and plain "s" never collides with Ctrl+S.
export function matches(e: KeyboardEvent, s: Shortcut): boolean {
  const ctrl = e.ctrlKey || e.metaKey;
  const evKey = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  const wantKey = s.key.length === 1 ? s.key.toLowerCase() : s.key;
  return (
    evKey === wantKey &&
    !!s.ctrl === ctrl &&
    !!s.alt === e.altKey &&
    !!s.shift === e.shiftKey
  );
}
