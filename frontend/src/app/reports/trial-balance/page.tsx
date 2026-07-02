"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Row = { name: string; ledger_type: string; dr_balance: number; cr_balance: number };
type Data = { rows: Row[]; total_dr: number; total_cr: number };

export default function TrialBalancePage() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api<Data>("/reports/trial-balance", { company: true }).then(setData).catch((e) => setErr(e.message));
  }, []);

  return (
    <Shell title="Trial Balance (Alt+T)">
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      {!data ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-blue/10 text-left">
                <th className="px-4 py-2 text-slate-700">Ledger</th>
                <th className="px-4 py-2 text-slate-500">Type</th>
                <th className="px-4 py-2 text-right text-brand-green">Debit</th>
                <th className="px-4 py-2 text-right text-brand-blue">Credit</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.name} className="border-t border-slate-100 hover:bg-brand-green/5">
                  <td className="px-4 py-2 font-medium text-slate-800">{r.name}</td>
                  <td className="px-4 py-2 text-xs text-slate-400">{r.ledger_type}</td>
                  <td className="px-4 py-2 text-right">{r.dr_balance > 0 ? inr(r.dr_balance) : "—"}</td>
                  <td className="px-4 py-2 text-right">{r.cr_balance > 0 ? inr(r.cr_balance) : "—"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                <td className="px-4 py-2 text-slate-800" colSpan={2}>Total</td>
                <td className="px-4 py-2 text-right text-brand-green">{inr(data.total_dr)}</td>
                <td className="px-4 py-2 text-right text-brand-blue">{inr(data.total_cr)}</td>
              </tr>
            </tfoot>
          </table>
          <div className={`px-4 py-2 text-xs ${Math.round(data.total_dr * 100) === Math.round(data.total_cr * 100) ? "bg-brand-green/10 text-brand-greenDark" : "bg-red-50 text-red-600"}`}>
            {Math.round(data.total_dr * 100) === Math.round(data.total_cr * 100)
              ? "Balanced — Total Debit equals Total Credit"
              : `Out of balance by ${inr(Math.abs(data.total_dr - data.total_cr))}`}
          </div>
        </div>
      )}
    </Shell>
  );
}
