"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Item = { id: number; name: string; sku: string | null; quantity: number; reorder_level: number; shortage: number; purchase_price: number };
type Data = { items: Item[]; count: number };

export default function LowStockPage() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => { api<Data>("/reports/low-stock", { company: true }).then(setData).catch(e => setErr(e.message)); }, []);

  return (
    <Shell title="Low Stock Report">
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      {!data ? <p className="text-sm text-slate-400">Loading…</p> : (
        <>
          <div className="mb-4 flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${data.count > 0 ? "bg-red-100 text-red-700" : "bg-brand-green/10 text-brand-greenDark"}`}>
              {data.count} item{data.count !== 1 ? "s" : ""} below reorder level
            </span>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-red-50 text-left">
                <tr>
                  <th className="px-4 py-2 text-red-700">Item</th>
                  <th className="px-4 py-2 text-red-700">SKU</th>
                  <th className="px-4 py-2 text-right text-red-700">In Stock</th>
                  <th className="px-4 py-2 text-right text-red-700">Reorder At</th>
                  <th className="px-4 py-2 text-right text-red-700">Shortage</th>
                  <th className="px-4 py-2 text-right text-red-700">Buy Price</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 && (
                  <tr><td className="px-4 py-6 text-center text-brand-green" colSpan={6}>All items above reorder level.</td></tr>
                )}
                {data.items.map(it => (
                  <tr key={it.id} className="border-t border-slate-100 bg-red-50/40">
                    <td className="px-4 py-2 font-medium text-slate-800">{it.name}</td>
                    <td className="px-4 py-2 text-slate-400">{it.sku || "—"}</td>
                    <td className="px-4 py-2 text-right text-red-600 font-bold">{it.quantity}</td>
                    <td className="px-4 py-2 text-right text-slate-500">{it.reorder_level}</td>
                    <td className="px-4 py-2 text-right text-red-700 font-semibold">{it.shortage}</td>
                    <td className="px-4 py-2 text-right">{inr(it.purchase_price)}</td>
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
