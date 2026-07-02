"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Flow = { label: string; amount: number };
type Data = { inflows: Flow[]; outflows: Flow[]; total_inflow: number; total_outflow: number; net_cash_flow: number };

export default function CashFlowPage() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { api<Data>("/reports/cash-flow", { company: true }).then(setData).catch(e => setErr(e.message)); }, []);

  return (
    <Shell title="Cash Flow (Alt+C)">
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      {!data ? <p className="text-sm text-slate-400">Loading…</p> : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <section className="card overflow-hidden">
              <div className="bg-brand-green px-4 py-2"><h2 className="font-bold text-white">Cash Inflows</h2></div>
              <table className="w-full text-sm">
                <tbody>
                  {data.inflows.map(f => (
                    <tr key={f.label} className="border-t border-slate-100">
                      <td className="px-4 py-2 text-slate-700">{f.label}</td>
                      <td className="px-4 py-2 text-right font-medium">{inr(f.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-brand-green bg-brand-green/5">
                    <td className="px-4 py-2 font-bold text-slate-800">Total Inflow</td>
                    <td className="px-4 py-2 text-right font-bold text-brand-green">{inr(data.total_inflow)}</td>
                  </tr>
                </tfoot>
              </table>
            </section>
            <section className="card overflow-hidden">
              <div className="bg-brand-blue px-4 py-2"><h2 className="font-bold text-white">Cash Outflows</h2></div>
              <table className="w-full text-sm">
                <tbody>
                  {data.outflows.map(f => (
                    <tr key={f.label} className="border-t border-slate-100">
                      <td className="px-4 py-2 text-slate-700">{f.label}</td>
                      <td className="px-4 py-2 text-right font-medium">{inr(f.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-brand-blue bg-brand-blue/5">
                    <td className="px-4 py-2 font-bold text-slate-800">Total Outflow</td>
                    <td className="px-4 py-2 text-right font-bold text-brand-blue">{inr(data.total_outflow)}</td>
                  </tr>
                </tfoot>
              </table>
            </section>
          </div>
          <div className={`card border-2 p-6 text-center ${data.net_cash_flow >= 0 ? "border-brand-green" : "border-red-400"}`}>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Net Cash Flow</p>
            <p className={`mt-1 text-4xl font-black ${data.net_cash_flow >= 0 ? "text-brand-green" : "text-red-500"}`}>
              {inr(Math.abs(data.net_cash_flow))}
            </p>
            <p className="mt-1 text-sm text-slate-400">{data.net_cash_flow >= 0 ? "Positive" : "Negative"}</p>
          </div>
        </div>
      )}
    </Shell>
  );
}
