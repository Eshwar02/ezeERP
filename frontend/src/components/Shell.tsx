"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, logout } from "@/lib/api";
import { ActionBusProvider } from "@/lib/actionBus";
import { useShortcuts } from "@/lib/useShortcuts";
import { sectionFor } from "@/lib/keymap";
import { ShortcutPanel } from "@/components/ShortcutPanel";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Gateway", hint: "Ctrl+H" },
  { href: "/masters/ledgers", label: "Ledgers", hint: "Alt+L" },
  { href: "/masters/groups", label: "Groups" },
  { href: "/masters/stock-items", label: "Stock Items", hint: "Alt+S" },
  { href: "/masters/customers", label: "Customers", hint: "Alt+C" },
  { href: "/masters/suppliers", label: "Suppliers", hint: "Alt+U" },
  { href: "/vouchers/sales", label: "Sales Voucher", hint: "F8" },
  { href: "/vouchers/purchase", label: "Purchase Voucher", hint: "F9" },
  { href: "/vouchers/credit-note", label: "Credit Note", hint: "Alt+F8" },
  { href: "/vouchers/debit-note", label: "Debit Note", hint: "Alt+F9" },
  { href: "/vouchers/payment", label: "Payment Voucher", hint: "F5" },
  { href: "/vouchers/receipt", label: "Receipt Voucher", hint: "F6" },
  { href: "/vouchers/journal", label: "Journal Voucher", hint: "F7" },
  { href: "/vouchers/contra", label: "Contra Voucher", hint: "F4" },
  { href: "/reports/balance-sheet", label: "Balance Sheet", hint: "Alt+B" },
  { href: "/reports/profit-loss", label: "Profit & Loss", hint: "Alt+P" },
  { href: "/reports/trial-balance", label: "Trial Balance", hint: "Alt+T" },
  { href: "/reports/stock-summary", label: "Stock Summary", hint: "Alt+R" },
  { href: "/reports/sales", label: "Sales Report" },
  { href: "/reports/purchases", label: "Purchase Report" },
  { href: "/reports/gst", label: "GST Report", hint: "Alt+X" },
];

export function Shell({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <ActionBusProvider>
      <ShellInner title={title}>{children}</ShellInner>
    </ActionBusProvider>
  );
}

function ShellInner({ children, title }: { children: React.ReactNode; title: string }) {
  useShortcuts();
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const activeSection = sectionFor(pathname);

  useEffect(() => {
    if (!getToken()) router.replace("/login");
    else setReady(true);
  }, [router]);

  if (!ready) return null;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white">
        <div className="flex items-center gap-2 px-5 py-4">
          <span className="text-xl font-black">
            <span className="text-brand-green">eze</span>
            <span className="text-brand-blue">ERP</span>
          </span>
        </div>
        <nav className="px-3 py-2">
          {NAV.map((n) => {
            const active = pathname === n.href || activeSection?.match.some((m) => n.href.startsWith(m));
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "mb-1 flex items-center justify-between rounded-md px-3 py-2 text-sm",
                  pathname === n.href
                    ? "bg-brand-green text-white"
                    : active
                      ? "bg-brand-green/10 text-brand-greenDark"
                      : "text-slate-700 hover:bg-brand-green/10"
                )}
              >
                <span>{n.label}</span>
                {n.hint && (
                  <span className={cn("kbd", pathname === n.href && "border-white/40 bg-white/20 text-white")}>
                    {n.hint}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <button
          className="mx-3 mt-4 text-xs text-slate-400 hover:text-brand-blue"
          onClick={() => { logout(); router.push("/login"); }}
        >
          Logout (Ctrl+Q)
        </button>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <h1 className="text-lg font-bold text-slate-800">{title}</h1>
          <Link href="/companies" className="text-xs text-brand-blue hover:underline">
            Switch Company (F1)
          </Link>
        </header>
        <div className="flex-1 p-6">{children}</div>
      </main>

      <ShortcutPanel />
    </div>
  );
}
