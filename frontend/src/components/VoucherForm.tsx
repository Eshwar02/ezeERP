"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAction } from "@/lib/actionBus";
import { ACTIONS } from "@/lib/keymap";
import { inr } from "@/lib/utils";

type Item = { id: number; name: string; selling_price: number; purchase_price: number; gst_percentage: number };
type Party = { id: number; name: string };
type Line = { stock_item_id: number | ""; name: string; quantity: number; rate: number; gst_percentage: number };

const blankLine = (): Line => ({ stock_item_id: "", name: "", quantity: 1, rate: 0, gst_percentage: 0 });

// Shared voucher entry form for Sales (F8), Purchase (F9), Credit Note (Alt+F8), Debit Note (Alt+F9).
export function VoucherForm({
  kind,
  partyEndpoint,
  partyLabel,
  partyKey,
  priceKey,
  saveLabel,
  onSaved,
}: {
  kind: "sales" | "purchase" | "credit-notes" | "debit-notes";
  partyEndpoint: string;
  partyLabel: string;
  partyKey: "customer_id" | "supplier_id";
  priceKey: "selling_price" | "purchase_price";
  saveLabel?: string;
  onSaved: (saved: any) => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [partyId, setPartyId] = useState<number | "">("");
  const [lines, setLines] = useState<Line[]>([blankLine()]);
  const [err, setErr] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  function addLine() {
    setLines((ls) => [...ls, blankLine()]);
  }
  function focusFirst() {
    rootRef.current?.querySelector<HTMLElement>("select,input,button")?.focus();
  }

  useEffect(() => {
    api<Item[]>("/masters/stock-items", { company: true }).then(setItems).catch(() => {});
    api<Party[]>(partyEndpoint, { company: true }).then(setParties).catch(() => {});
  }, [partyEndpoint]);

  function pickItem(idx: number, itemId: string) {
    const it = items.find((i) => i.id === Number(itemId));
    setLines((ls) =>
      ls.map((l, i) =>
        i === idx
          ? {
              ...l,
              stock_item_id: it ? it.id : "",
              name: it ? it.name : "",
              rate: it ? (it as any)[priceKey] : l.rate,
              gst_percentage: it ? it.gst_percentage : l.gst_percentage,
            }
          : l
      )
    );
  }

  function updLine(idx: number, key: keyof Line, val: any) {
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, [key]: val } : l)));
  }

  const subtotal = lines.reduce((s, l) => s + Number(l.quantity) * Number(l.rate), 0);
  const tax = lines.reduce((s, l) => s + (Number(l.quantity) * Number(l.rate) * Number(l.gst_percentage)) / 100, 0);
  const total = subtotal + tax;

  async function save() {
    setErr("");
    const payload: any = {
      [partyKey]: partyId || null,
      items: lines
        .filter((l) => Number(l.quantity) > 0)
        .map((l) => ({
          stock_item_id: l.stock_item_id || null,
          name: l.name,
          quantity: Number(l.quantity),
          rate: Number(l.rate),
          gst_percentage: Number(l.gst_percentage),
        })),
    };
    if (payload.items.length === 0) {
      setErr("Add at least one line item.");
      return;
    }
    try {
      const saved = await api(`/vouchers/${kind}`, { method: "POST", body: payload, company: true });
      setLines([blankLine()]);
      setPartyId("");
      onSaved(saved);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  useAction(ACTIONS.save, save);
  useAction(ACTIONS.addLine, addLine);
  useAction(ACTIONS.focusFirst, focusFirst);

  return (
    <div ref={rootRef} className="card p-5">
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      <div className="mb-4 max-w-sm">
        <label className="label">{partyLabel}</label>
        <select className="input" value={partyId} onChange={(e) => setPartyId(e.target.value ? Number(e.target.value) : "")}>
          <option value="">— Select {partyLabel} —</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-brand-blue/10 text-left">
          <tr>
            <th className="px-2 py-2">Item</th>
            <th className="px-2 py-2 w-20">Qty</th>
            <th className="px-2 py-2 w-28">Rate</th>
            <th className="px-2 py-2 w-20">GST%</th>
            <th className="px-2 py-2 w-28 text-right">Amount</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, idx) => {
            const amt = Number(l.quantity) * Number(l.rate) * (1 + Number(l.gst_percentage) / 100);
            return (
              <tr key={idx} className="border-t border-slate-100">
                <td className="px-2 py-1">
                  <select className="input" value={l.stock_item_id} onChange={(e) => pickItem(idx, e.target.value)}>
                    <option value="">— item —</option>
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>{it.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-2 py-1"><input className="input" type="number" step="any" value={l.quantity} onChange={(e) => updLine(idx, "quantity", e.target.value)} /></td>
                <td className="px-2 py-1"><input className="input" type="number" step="any" value={l.rate} onChange={(e) => updLine(idx, "rate", e.target.value)} /></td>
                <td className="px-2 py-1"><input className="input" type="number" step="any" value={l.gst_percentage} onChange={(e) => updLine(idx, "gst_percentage", e.target.value)} /></td>
                <td className="px-2 py-1 text-right">{inr(amt)}</td>
                <td className="px-2 py-1">
                  <button className="text-slate-400 hover:text-red-500" onClick={() => setLines((ls) => ls.filter((_, i) => i !== idx))}>×</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button className="btn-ghost mt-3 text-xs" onClick={addLine}>+ Add line <span className="kbd ml-1">Alt+N</span></button>

      <div className="mt-4 flex items-end justify-between">
        <div className="text-sm text-slate-500">
          <div>Subtotal: <span className="font-medium text-slate-700">{inr(subtotal)}</span></div>
          <div>Tax: <span className="font-medium text-slate-700">{inr(tax)}</span></div>
          <div className="text-base">Total: <span className="font-bold text-brand-green">{inr(total)}</span></div>
        </div>
        <button className="btn-green" onClick={save}>{saveLabel ?? (kind === "sales" ? "Save Sale" : kind === "purchase" ? "Save Purchase" : kind === "credit-notes" ? "Save Credit Note" : "Save Debit Note")} <span className="kbd ml-1 border-white/40 bg-white/20 text-white">Ctrl+S</span></button>
      </div>
    </div>
  );
}
