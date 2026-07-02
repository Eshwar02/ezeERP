"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { VoucherForm } from "@/components/VoucherForm";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Note = { id: number; note_number: string; total: number; date: string };

export default function CreditNotePage() {
  const [notes, setNotes] = useState<Note[]>([]);

  function load() {
    api<Note[]>("/vouchers/credit-notes", { company: true }).then(setNotes).catch(() => {});
  }
  useEffect(load, []);

  return (
    <Shell title="Credit Note — Sales Return (Alt+F8)">
      <div className="mb-4 rounded bg-brand-green/10 px-4 py-2 text-sm text-brand-greenDark">
        Credit Note records goods returned by customer. Stock increases, customer balance reduces.
      </div>
      <VoucherForm
        kind="credit-notes"
        partyEndpoint="/masters/customers"
        partyLabel="Customer"
        partyKey="customer_id"
        priceKey="selling_price"
        saveLabel="Save Credit Note"
        onSaved={load}
      />

      <h2 className="mb-3 mt-8 text-lg font-bold text-slate-700">Recent Credit Notes</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-green/10 text-left">
            <tr>
              <th className="px-4 py-2">Note #</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {notes.length === 0 && (
              <tr><td className="px-4 py-6 text-center text-slate-400" colSpan={3}>No credit notes yet.</td></tr>
            )}
            {notes.map((n) => (
              <tr key={n.id} className="border-t border-slate-100 hover:bg-brand-green/5">
                <td className="px-4 py-2 font-medium text-brand-green">{n.note_number}</td>
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
