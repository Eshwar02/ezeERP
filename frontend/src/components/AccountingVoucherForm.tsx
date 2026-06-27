"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Ledger = { id: number; name: string; ledger_type: string };
type Line = { ledger_id: number | ""; dr_amount: number; cr_amount: number };

const blankLine = (): Line => ({ ledger_id: "", dr_amount: 0, cr_amount: 0 });

// Double-entry voucher form for Contra / Payment (F5) / Receipt (F6) / Journal (F7).
export function AccountingVoucherForm({
  voucherType,
  onSaved,
}: {
  voucherType: "Contra" | "Payment" | "Receipt" | "Journal";
  onSaved: (saved: any) => void;
}) {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [lines, setLines] = useState<Line[]>([blankLine(), blankLine()]);
  const [narration, setNarration] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    api<Ledger[]>("/accounting/ledgers", { company: true }).then(setLedgers).catch(() => {});
  }, []);

  function updLine(idx: number, key: keyof Line, val: any) {
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, [key]: val } : l)));
  }

  const drTotal = lines.reduce((s, l) => s + Number(l.dr_amount || 0), 0);
  const crTotal = lines.reduce((s, l) => s + Number(l.cr_amount || 0), 0);
  const balanced = drTotal > 0 && Math.round(drTotal * 100) === Math.round(crTotal * 100);

  async function save() {
    setErr("");
    const payload = {
      voucher_type: voucherType,
      narration,
      entries: lines
        .filter((l) => l.ledger_id && (Number(l.dr_amount) > 0 || Number(l.cr_amount) > 0))
        .map((l) => ({
          ledger_id: Number(l.ledger_id),
          dr_amount: Number(l.dr_amount) || 0,
          cr_amount: Number(l.cr_amount) || 0,
        })),
    };
    try {
      const saved = await api("/accounting/vouchers", { method: "POST", body: payload, company: true });
      setLines([blankLine(), blankLine()]);
      setNarration("");
      onSaved(saved);
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <div className="card p-5">
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}

      <table className="w-full text-sm">
        <thead className="bg-brand-blue/10 text-left">
          <tr>
            <th className="px-2 py-2">Ledger</th>
            <th className="px-2 py-2 w-32 text-right">Debit</th>
            <th className="px-2 py-2 w-32 text-right">Credit</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, idx) => (
            <tr key={idx} className="border-t border-slate-100">
              <td className="px-2 py-1">
                <select
                  className="input"
                  value={l.ledger_id}
                  onChange={(e) => updLine(idx, "ledger_id", e.target.value ? Number(e.target.value) : "")}
                >
                  <option value="">— ledger —</option>
                  {ledgers.map((lg) => (
                    <option key={lg.id} value={lg.id}>{lg.name}</option>
                  ))}
                </select>
              </td>
              <td className="px-2 py-1">
                <input
                  className="input text-right"
                  type="number"
                  step="any"
                  value={l.dr_amount || ""}
                  onChange={(e) => updLine(idx, "dr_amount", e.target.value)}
                />
              </td>
              <td className="px-2 py-1">
                <input
                  className="input text-right"
                  type="number"
                  step="any"
                  value={l.cr_amount || ""}
                  onChange={(e) => updLine(idx, "cr_amount", e.target.value)}
                />
              </td>
              <td className="px-2 py-1">
                <button
                  className="text-slate-400 hover:text-red-500"
                  onClick={() => setLines((ls) => (ls.length > 2 ? ls.filter((_, i) => i !== idx) : ls))}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="btn-ghost mt-3 text-xs" onClick={() => setLines((ls) => [...ls, blankLine()])}>
        + Add line
      </button>

      <div className="mt-4 max-w-md">
        <label className="label">Narration</label>
        <input className="input" value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="Optional note" />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div className="text-sm text-slate-500">
          <div>Total Debit: <span className="font-medium text-slate-700">{inr(drTotal)}</span></div>
          <div>Total Credit: <span className="font-medium text-slate-700">{inr(crTotal)}</span></div>
          <div className={balanced ? "text-brand-green" : "text-red-500"}>
            {balanced ? "Balanced" : `Out of balance by ${inr(Math.abs(drTotal - crTotal))}`}
          </div>
        </div>
        <button className="btn-green disabled:opacity-40" disabled={!balanced} onClick={save}>
          Save {voucherType}
        </button>
      </div>
    </div>
  );
}
