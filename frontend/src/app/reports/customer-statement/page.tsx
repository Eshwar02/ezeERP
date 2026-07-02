"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Customer = { id: number; name: string; mobile: string | null; outstanding_balance: number };
type Txn = { date: string; ref: string; type: string; amount: number };
type Detail = { customer: Customer; transactions: Txn[]; total_billed: number; outstanding_balance: number };

export default function CustomerStatementPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => { api<Customer[]>("/reports/customer-statement", { company: true }).then(setCustomers).catch(e => setErr(e.message)); }, []);

  function load(id: number) {
    setSelectedId(id); setDetail(null);
    api<Detail>(`/reports/customer-statement/${id}`, { company: true }).then(setDetail).catch(e => setErr(e.message));
  }

  return (
    <Shell title="Customer Statement">
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      <div className="mb-6 max-w-sm">
        <label className="label">Select Customer</label>
        <select className="input" value={selectedId} onChange={e => e.target.value && load(Number(e.target.value))}>
          <option value="">— choose customer —</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {detail && (
        <>
          <div className="mb-4 grid gap-4 md:grid-cols-3">
            <div className="card p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Customer</p>
              <p className="mt-1 font-bold text-slate-800">{detail.customer.name}</p>
              {detail.customer.mobile && <p className="text-sm text-slate-500">{detail.customer.mobile}</p>}
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Billed</p>
              <p className="mt-1 text-2xl font-black text-brand-blue">{inr(detail.total_billed)}</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Outstanding</p>
              <p className={`mt-1 text-2xl font-black ${detail.outstanding_balance > 0 ? "text-red-500" : "text-brand-green"}`}>
                {inr(detail.outstanding_balance)}
              </p>
            </div>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-green/10 text-left">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Invoice #</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {detail.transactions.length === 0 && (
                  <tr><td className="px-4 py-6 text-center text-slate-400" colSpan={4}>No transactions.</td></tr>
                )}
                {detail.transactions.map((t, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-brand-green/5">
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
