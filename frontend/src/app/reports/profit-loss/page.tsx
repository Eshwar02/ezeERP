"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Ledger = { name: string; balance: number };
type Data = {
  sales_total: number; sales_tax: number;
  purchase_total: number; purchase_tax: number;
  income_ledgers: Ledger[]; expense_ledgers: Ledger[];
  total_income: number; total_expense: number; net_profit: number;
};

export default function ProfitLossPage() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api<Data>("/reports/profit-loss", { company: true }).then(setData).catch((e) => setErr(e.message));
  }, []);

  return (
    <Shell title="Profit & Loss (Alt+P)">
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      {!data ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <section className="card overflow-hidden">
              <div className="bg-brand-green px-4 py-2">
                <h2 className="font-bold text-white">Income</h2>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-700">Sales (Vouchers)</td>
                    <td className="px-4 py-2 text-right font-medium">{inr(data.sales_total)}</td>
                  </tr>
                  {data.income_ledgers.map((l) => (
                    <tr key={l.name} className="border-t border-slate-100">
                      <td className="px-4 py-2 text-slate-700">{l.name}</td>
                      <td className="px-4 py-2 text-right font-medium">{inr(l.balance)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-brand-green bg-brand-green/5">
                    <td className="px-4 py-2 font-bold text-slate-800">Total Income</td>
                    <td className="px-4 py-2 text-right font-bold text-brand-green">{inr(data.total_income)}</td>
                  </tr>
                </tfoot>
              </table>
            </section>

            <section className="card overflow-hidden">
              <div className="bg-brand-blue px-4 py-2">
                <h2 className="font-bold text-white">Expenses</h2>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-700">Purchases (Vouchers)</td>
                    <td className="px-4 py-2 text-right font-medium">{inr(data.purchase_total)}</td>
                  </tr>
                  {data.expense_ledgers.map((l) => (
                    <tr key={l.name} className="border-t border-slate-100">
                      <td className="px-4 py-2 text-slate-700">{l.name}</td>
                      <td className="px-4 py-2 text-right font-medium">{inr(l.balance)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-brand-blue bg-brand-blue/5">
                    <td className="px-4 py-2 font-bold text-slate-800">Total Expenses</td>
                    <td className="px-4 py-2 text-right font-bold text-brand-blue">{inr(data.total_expense)}</td>
                  </tr>
                </tfoot>
              </table>
            </section>
          </div>

          <div className={`card p-6 text-center ${data.net_profit >= 0 ? "border-brand-green" : "border-red-400"} border-2`}>
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">
              {data.net_profit >= 0 ? "Net Profit" : "Net Loss"}
            </p>
            <p className={`mt-1 text-4xl font-black ${data.net_profit >= 0 ? "text-brand-green" : "text-red-500"}`}>
              {inr(Math.abs(data.net_profit))}
            </p>
          </div>
        </div>
      )}
    </Shell>
  );
}
