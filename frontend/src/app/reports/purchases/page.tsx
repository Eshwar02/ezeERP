"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { ExportButton } from "@/components/ExportButton";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Row = { bill_number: string; date: string; supplier: string; subtotal: number; tax_total: number; total: number };
type Data = { purchases: Row[]; total: number; count: number };

export default function PurchaseReportPage() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api<Data>("/reports/purchases", { company: true }).then(setData).catch((e) => setErr(e.message));
  }, []);

  return (
    <Shell title="Purchase Report">
      <div className="mb-4 flex justify-end"><ExportButton report="purchases" /></div>
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      {!data ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="card p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Bills</p>
              <p className="mt-1 text-3xl font-black text-slate-800">{data.count}</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Purchases</p>
              <p className="mt-1 text-3xl font-black text-brand-blue">{inr(data.total)}</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-blue/10 text-left">
                <tr>
                  <th className="px-4 py-2">Bill #</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Supplier</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                  <th className="px-4 py-2 text-right">Tax</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.purchases.length === 0 && (
                  <tr><td className="px-4 py-6 text-center text-slate-400" colSpan={6}>No purchases yet.</td></tr>
                )}
                {data.purchases.map((p) => (
                  <tr key={p.bill_number} className="border-t border-slate-100 hover:bg-brand-blue/5">
                    <td className="px-4 py-2 font-medium text-brand-blue">{p.bill_number}</td>
                    <td className="px-4 py-2 text-slate-500">{p.date?.slice(0, 10)}</td>
                    <td className="px-4 py-2">{p.supplier}</td>
                    <td className="px-4 py-2 text-right">{inr(p.subtotal)}</td>
                    <td className="px-4 py-2 text-right text-slate-400">{inr(p.tax_total)}</td>
                    <td className="px-4 py-2 text-right font-bold text-brand-blue">{inr(p.total)}</td>
                  </tr>
                ))}
              </tbody>
              {data.purchases.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-brand-blue bg-brand-blue/5 font-bold">
                    <td className="px-4 py-2 text-slate-800" colSpan={5}>Total</td>
                    <td className="px-4 py-2 text-right text-brand-blue">{inr(data.total)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}
    </Shell>
  );
}
