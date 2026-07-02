"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Supplier = { id: number; name: string; mobile: string | null; outstanding_dues: number };
type Txn = { date: string; ref: string; type: string; amount: number };
type Detail = { supplier: Supplier; transactions: Txn[]; total_purchased: number; outstanding_dues: number };

export default function SupplierStatementPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => { api<Supplier[]>("/reports/supplier-statement", { company: true }).then(setSuppliers).catch(e => setErr(e.message)); }, []);

  function load(id: number) {
    setSelectedId(id); setDetail(null);
    api<Detail>(`/reports/supplier-statement/${id}`, { company: true }).then(setDetail).catch(e => setErr(e.message));
  }

  return (
    <Shell title="Supplier Statement">
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      <div className="mb-6 max-w-sm">
        <label className="label">Select Supplier</label>
        <select className="input" value={selectedId} onChange={e => e.target.value && load(Number(e.target.value))}>
          <option value="">— choose supplier —</option>
          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      {detail && (
        <>
          <div className="mb-4 grid gap-4 md:grid-cols-3">
            <div className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Supplier</p>
              <p className="mt-1 font-bold text-slate-800">{detail.supplier.name}</p>
              {detail.supplier.mobile && <p className="text-sm text-slate-500">{detail.supplier.mobile}</p>}
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Purchased</p>
              <p className="mt-1 text-2xl font-black text-brand-blue">{inr(detail.total_purchased)}</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Outstanding Dues</p>
              <p className={`mt-1 text-2xl font-black ${detail.outstanding_dues > 0 ? "text-red-500" : "text-brand-green"}`}>
                {inr(detail.outstanding_dues)}
              </p>
            </div>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-blue/10 text-left">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Bill #</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {detail.transactions.length === 0 && (
                  <tr><td className="px-4 py-6 text-center text-slate-400" colSpan={4}>No transactions.</td></tr>
                )}
                {detail.transactions.map((t, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-brand-blue/5">
                    <td className="px-4 py-2 text-slate-500">{t.date}</td>
                    <td className="px-4 py-2 font-medium text-brand-blue">{t.ref}</td>
                    <td className="px-4 py-2 text-slate-600">{t.type}</td>
                    <td className="px-4 py-2 text-right font-medium">{inr(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Shell>
  );
}
