"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { ExportButton } from "@/components/ExportButton";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Row = { name: string; type: string; balance: number };
type Data = { assets: Row[]; liabilities: Row[]; total_assets: number; total_liabilities: number };

export default function BalanceSheetPage() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api<Data>("/reports/balance-sheet", { company: true })
      .then(setData)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <Shell title="Balance Sheet (Alt+B)">
      <div className="mb-4 flex justify-end"><ExportButton report="balance-sheet" /></div>
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      {!data ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <section className="card overflow-hidden">
            <div className="bg-brand-green px-4 py-2">
              <h2 className="font-bold text-white">Assets</h2>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {data.assets.map((r) => (
                  <tr key={r.name} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-700">{r.name}</td>
                    <td className="px-4 py-2 text-xs text-slate-400">{r.type}</td>
                    <td className="px-4 py-2 text-right font-medium">{inr(r.balance)}</td>
                  </tr>
                ))}
                {data.assets.length === 0 && (
                  <tr><td className="px-4 py-4 text-slate-400" colSpan={3}>No asset ledgers.</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-brand-green bg-brand-green/5">
                  <td className="px-4 py-2 font-bold text-slate-800" colSpan={2}>Total Assets</td>
                  <td className="px-4 py-2 text-right font-bold text-brand-green">{inr(data.total_assets)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="card overflow-hidden">
            <div className="bg-brand-blue px-4 py-2">
              <h2 className="font-bold text-white">Liabilities</h2>
            </div>
            <table className="w-full text-sm">
              <tbody>
                {data.liabilities.map((r) => (
                  <tr key={r.name} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-700">{r.name}</td>
                    <td className="px-4 py-2 text-xs text-slate-400">{r.type}</td>
                    <td className="px-4 py-2 text-right font-medium">{inr(r.balance)}</td>
                  </tr>
                ))}
                {data.liabilities.length === 0 && (
                  <tr><td className="px-4 py-4 text-slate-400" colSpan={3}>No liability ledgers.</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-brand-blue bg-brand-blue/5">
                  <td className="px-4 py-2 font-bold text-slate-800" colSpan={2}>Total Liabilities</td>
                  <td className="px-4 py-2 text-right font-bold text-brand-blue">{inr(data.total_liabilities)}</td>
                </tr>
              </tfoot>
            </table>
          </section>
        </div>
      )}
    </Shell>
  );
}
