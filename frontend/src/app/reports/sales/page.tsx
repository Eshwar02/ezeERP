"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Row = { invoice_number: string; date: string; customer: string; subtotal: number; tax_total: number; total: number };
type Data = { sales: Row[]; total: number; count: number };

export default function SalesReportPage() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api<Data>("/reports/sales", { company: true }).then(setData).catch((e) => setErr(e.message));
  }, []);

  return (
    <Shell title="Sales Report">
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      {!data ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="card p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Invoices</p>
              <p className="mt-1 text-3xl font-black text-slate-800">{data.count}</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Sales</p>
              <p className="mt-1 text-3xl font-black text-brand-green">{inr(data.total)}</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-green/10 text-left">
                <tr>
                  <th className="px-4 py-2">Invoice #</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2 text-right">Subtotal</th>
                  <th className="px-4 py-2 text-right">Tax</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.sales.length === 0 && (
                  <tr><td className="px-4 py-6 text-center text-slate-400" colSpan={6}>No sales yet.</td></tr>
                )}
                {data.sales.map((s) => (
                  <tr key={s.invoice_number} className="border-t border-slate-100 hover:bg-brand-green/5">
                    <td className="px-4 py-2 font-medium text-brand-blue">{s.invoice_number}</td>
                    <td className="px-4 py-2 text-slate-500">{s.date?.slice(0, 10)}</td>
                    <td className="px-4 py-2">{s.customer}</td>
                    <td className="px-4 py-2 text-right">{inr(s.subtotal)}</td>
                    <td className="px-4 py-2 text-right text-slate-400">{inr(s.tax_total)}</td>
                    <td className="px-4 py-2 text-right font-bold text-brand-green">{inr(s.total)}</td>
                  </tr>
                ))}
              </tbody>
              {data.sales.length > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-brand-green bg-brand-green/5 font-bold">
                    <td className="px-4 py-2 text-slate-800" colSpan={5}>Total</td>
                    <td className="px-4 py-2 text-right text-brand-green">{inr(data.total)}</td>
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
