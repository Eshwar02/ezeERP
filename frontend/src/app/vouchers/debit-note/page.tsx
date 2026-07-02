"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { VoucherForm } from "@/components/VoucherForm";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Note = { id: number; note_number: string; total: number; date: string };

export default function DebitNotePage() {
  const [notes, setNotes] = useState<Note[]>([]);

  function load() {
    api<Note[]>("/vouchers/debit-notes", { company: true }).then(setNotes).catch(() => {});
  }
  useEffect(load, []);

  return (
    <Shell title="Debit Note — Purchase Return (Alt+F9)">
      <div className="mb-4 rounded bg-brand-blue/10 px-4 py-2 text-sm text-brand-blue">
        Debit Note records goods returned to supplier. Stock decreases, supplier dues reduce.
      </div>
      <VoucherForm
        kind="debit-notes"
        partyEndpoint="/masters/suppliers"
        partyLabel="Supplier"
        partyKey="supplier_id"
        priceKey="purchase_price"
        saveLabel="Save Debit Note"
        onSaved={load}
      />

      <h2 className="mb-3 mt-8 text-lg font-bold text-slate-700">Recent Debit Notes</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-blue/10 text-left">
            <tr>
              <th className="px-4 py-2">Note #</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {notes.length === 0 && (
              <tr><td className="px-4 py-6 text-center text-slate-400" colSpan={3}>No debit notes yet.</td></tr>
            )}
            {notes.map((n) => (
              <tr key={n.id} className="border-t border-slate-100 hover:bg-brand-blue/5">
                <td className="px-4 py-2 font-medium text-brand-blue">{n.note_number}</td>
                <td className="px-4 py-2 text-slate-500">{n.date?.slice(0, 10)}</td>
                <td className="px-4 py-2 text-right font-medium">{inr(n.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
