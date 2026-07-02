"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { ExportButton } from "@/components/ExportButton";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Item = {
  name: string; sku: string | null; quantity: number;
  purchase_price: number; selling_price: number;
  value: number; reorder_level: number; low_stock: boolean;
};
type Data = { items: Item[]; total_value: number; low_stock_count: number };

export default function StockSummaryPage() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api<Data>("/reports/stock-summary", { company: true }).then(setData).catch((e) => setErr(e.message));
  }, []);

  return (
    <Shell title="Stock Summary (Alt+R)">
      <div className="mb-4 flex justify-end"><ExportButton report="stock-summary" /></div>
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      {!data ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <div className="card p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Items</p>
              <p className="mt-1 text-3xl font-black text-slate-800">{data.items.length}</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Stock Value</p>
              <p className="mt-1 text-3xl font-black text-brand-green">{inr(data.total_value)}</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Low Stock</p>
              <p className={`mt-1 text-3xl font-black ${data.low_stock_count > 0 ? "text-red-500" : "text-brand-green"}`}>
                {data.low_stock_count}
              </p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-blue/10 text-left">
                <tr>
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">SKU</th>
                  <th className="px-4 py-2 text-right">Qty</th>
                  <th className="px-4 py-2 text-right">Reorder</th>
                  <th className="px-4 py-2 text-right">Buy</th>
                  <th className="px-4 py-2 text-right">Sell</th>
                  <th className="px-4 py-2 text-right">Value</th>
                  <th className="px-4 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length === 0 && (
                  <tr><td className="px-4 py-6 text-center text-slate-400" colSpan={8}>No stock items.</td></tr>
                )}
                {data.items.map((it) => (
                  <tr key={it.name} className={`border-t border-slate-100 ${it.low_stock ? "bg-red-50/50" : "hover:bg-brand-green/5"}`}>
                    <td className="px-4 py-2 font-medium text-slate-800">{it.name}</td>
                    <td className="px-4 py-2 text-slate-400">{it.sku || "—"}</td>
                    <td className="px-4 py-2 text-right">{it.quantity}</td>
                    <td className="px-4 py-2 text-right text-slate-400">{it.reorder_level}</td>
                    <td className="px-4 py-2 text-right">{inr(it.purchase_price)}</td>
                    <td className="px-4 py-2 text-right">{inr(it.selling_price)}</td>
                    <td className="px-4 py-2 text-right font-medium text-brand-green">{inr(it.value)}</td>
                    <td className="px-4 py-2 text-center">
                      {it.low_stock ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">Low</span>
                      ) : (
                        <span className="rounded-full bg-brand-green/10 px-2 py-0.5 text-xs font-medium text-brand-greenDark">OK</span>
                      )}
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
