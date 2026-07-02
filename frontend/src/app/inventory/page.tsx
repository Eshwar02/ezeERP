"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/Shell";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Item = { id: number; name: string; sku: string | null; quantity: number; selling_price: number; reorder_level: number; low_stock: boolean };
type Summary = { items: Item[]; total_value: number; low_stock_count: number };

export default function InventoryPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [adjustId, setAdjustId] = useState<number | null>(null);
  const [qtyChange, setQtyChange] = useState("");
  const [adjErr, setAdjErr] = useState("");
  const [err, setErr] = useState("");

  function load() {
    api<Summary>("/reports/stock-summary", { company: true }).then(setData).catch(e => setErr(e.message));
  }
  useEffect(load, []);

  async function submitAdj(e: React.FormEvent) {
    e.preventDefault();
    if (!adjustId) return;
    setAdjErr("");
    try {
      await api(`/masters/stock-items/${adjustId}/adjust`, { method: "POST", body: { qty_change: Number(qtyChange) }, company: true });
      setAdjustId(null); setQtyChange(""); load();
    } catch (e: any) { setAdjErr(e.message); }
  }

  return (
    <Shell title="Inventory Dashboard (Ctrl+I)">
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      {!data ? <p className="text-sm text-slate-400">Loading…</p> : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="card p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Items</p>
              <p className="mt-1 text-3xl font-black text-slate-800">{data.items.length}</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Stock Value</p>
              <p className="mt-1 text-3xl font-black text-brand-green">{inr(data.total_value)}</p>
            </div>
            <div className={`card p-5 text-center ${data.low_stock_count > 0 ? "border-2 border-red-300" : ""}`}>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Low Stock</p>
              <p className={`mt-1 text-3xl font-black ${data.low_stock_count > 0 ? "text-red-500" : "text-brand-green"}`}>{data.low_stock_count}</p>
            </div>
            <div className="card flex flex-col items-center justify-center gap-2 p-5">
              <Link href="/reports/low-stock" className="btn-blue w-full py-1.5 text-center text-xs">Low Stock Report</Link>
              <Link href="/reports/item-movement" className="btn-ghost w-full py-1.5 text-center text-xs">Item Movement</Link>
            </div>
          </div>

          {adjustId && (
            <form onSubmit={submitAdj} className="card mb-6 flex items-end gap-4 p-4">
              <div>
                <p className="label">Adjusting: <span className="font-bold text-brand-green">{data.items.find(i => i.id === adjustId)?.name}</span></p>
                <label className="label mt-2">Qty Change (+ add / − remove)</label>
                <input className="input w-36" type="number" step="any" value={qtyChange} onChange={e => setQtyChange(e.target.value)} required autoFocus />
              </div>
              {adjErr && <p className="text-sm text-red-600">{adjErr}</p>}
              <button className="btn-green" type="submit">Apply</button>
              <button className="btn-ghost" type="button" onClick={() => setAdjustId(null)}>Cancel</button>
            </form>
          )}

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-blue/10 text-left">
                <tr>
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">SKU</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Reorder</th>
                  <th className="px-4 py-2 text-right">Sell Price</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(it => (
                  <tr key={it.id} className={`border-t border-slate-100 ${it.low_stock ? "bg-red-50/40" : "hover:bg-brand-green/5"}`}>
                    <td className="px-4 py-2 font-medium text-slate-800">{it.name}</td>
                    <td className="px-4 py-2 text-slate-400">{it.sku || "—"}</td>
                    <td className={`px-4 py-2 text-right font-bold ${it.low_stock ? "text-red-600" : "text-slate-700"}`}>{it.quantity}</td>
                    <td className="px-4 py-2 text-right text-slate-400">{it.reorder_level}</td>
                    <td className="px-4 py-2 text-right">{inr(it.selling_price)}</td>
                    <td className="px-4 py-2 text-center">
                      {it.low_stock
                        ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">Low</span>
                        : <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs font-medium text-brand-greenDark">OK</span>}
                    </td>
                    <td className="px-4 py-2">
                      <button className="text-xs text-brand-blue hover:underline" onClick={() => { setAdjustId(it.id); setQtyChange(""); }}>
                        Adjust
                      </button>
                    </td>
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
