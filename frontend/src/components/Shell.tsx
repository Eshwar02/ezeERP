"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken, logout } from "@/lib/api";
import { useShortcuts } from "@/lib/useShortcuts";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Gateway", hint: "Ctrl+H" },
  { href: "/masters/ledgers", label: "Ledgers", hint: "Alt+L" },
  { href: "/masters/stock-items", label: "Stock Items", hint: "Alt+S" },
  { href: "/masters/customers", label: "Customers" },
  { href: "/masters/suppliers", label: "Suppliers" },
  { href: "/vouchers/sales", label: "Sales Voucher", hint: "F8" },
  { href: "/vouchers/purchase", label: "Purchase Voucher", hint: "F9" },
  { href: "/vouchers/payment", label: "Payment Voucher", hint: "F5" },
  { href: "/vouchers/receipt", label: "Receipt Voucher", hint: "F6" },
  { href: "/vouchers/journal", label: "Journal Voucher", hint: "F7" },
  { href: "/vouchers/contra", label: "Contra Voucher" },
];

export function Shell({ children, title }: { children: React.ReactNode; title: string }) {
  useShortcuts();
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

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
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "mb-1 flex items-center justify-between rounded-md px-3 py-2 text-sm",
                pathname === n.href
                  ? "bg-brand-green text-white"
                  : "text-slate-700 hover:bg-brand-green/10"
              )}
            >
              <span>{n.label}</span>
              {n.hint && <span className="kbd">{n.hint}</span>}
            </Link>
          ))}
        </nav>
        <button
          className="mx-3 mt-4 text-xs text-slate-400 hover:text-brand-blue"
          onClick={() => { logout(); router.push("/login"); }}
        >
          Logout (Ctrl+Q)
        </button>
      </aside>

      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
          <h1 className="text-lg font-bold text-slate-800">{title}</h1>
          <Link href="/companies" className="text-xs text-brand-blue hover:underline">
            Switch Company (F1)
          </Link>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
