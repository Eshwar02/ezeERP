"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { api } from "@/lib/api";

type Item = { id: number; name: string; sku: string | null; quantity: number };
type Movement = { date: string; type: string; ref: string; qty_in: number; qty_out: number };
type Detail = { item: Item; movements: Movement[]; total_in: number; total_out: number; current_qty: number };

export default function ItemMovementPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => { api<Item[]>("/reports/item-movement", { company: true }).then(setItems).catch(e => setErr(e.message)); }, []);

  function load(id: number) {
    setSelectedId(id);
    setDetail(null);
    api<Detail>(`/reports/item-movement/${id}`, { company: true }).then(setDetail).catch(e => setErr(e.message));
  }

  return (
    <Shell title="Item Movement Report">
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      <div className="mb-6 max-w-sm">
        <label className="label">Select Stock Item</label>
        <select className="input" value={selectedId} onChange={e => e.target.value && load(Number(e.target.value))}>
          <option value="">— choose item —</option>
          {items.map(it => <option key={it.id} value={it.id}>{it.name}{it.sku ? ` (${it.sku})` : ""}</option>)}
        </select>
      </div>

      {detail && (
        <>
          <div className="mb-4 grid gap-4 md:grid-cols-3">
            <div className="card p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total In</p>
              <p className="mt-1 text-2xl font-black text-brand-green">{detail.total_in}</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Total Out</p>
              <p className="mt-1 text-2xl font-black text-brand-blue">{detail.total_out}</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Current Qty</p>
              <p className="mt-1 text-2xl font-black text-slate-800">{detail.current_qty}</p>
            </div>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-brand-blue/10 text-left">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Reference</th>
                  <th className="px-4 py-2 text-right text-brand-green">Qty In</th>
                  <th className="px-4 py-2 text-right text-brand-blue">Qty Out</th>
                </tr>
              </thead>
              <tbody>
                {detail.movements.length === 0 && (
                  <tr><td className="px-4 py-6 text-center text-slate-400" colSpan={5}>No movements recorded.</td></tr>
                )}
                {detail.movements.map((m, i) => (
                  <tr key={i} className="border-t border-slate-100 hover:bg-brand-green/5">
                    <td className="px-4 py-2 text-slate-500">{m.date}</td>
                    <td className="px-4 py-2">{m.type}</td>
                    <td className="px-4 py-2 font-medium text-brand-blue">{m.ref}</td>
                    <td className="px-4 py-2 text-right text-brand-green font-medium">{m.qty_in > 0 ? `+${m.qty_in}` : "—"}</td>
                    <td className="px-4 py-2 text-right text-brand-blue font-medium">{m.qty_out > 0 ? `-${m.qty_out}` : "—"}</td>
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
