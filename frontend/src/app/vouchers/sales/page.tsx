"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { VoucherForm } from "@/components/VoucherForm";
import { api, downloadPdf } from "@/lib/api";
import { inr } from "@/lib/utils";

type Sale = { id: number; invoice_number: string; total: number; date: string };

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);

  function load() {
    api<Sale[]>("/vouchers/sales", { company: true }).then(setSales).catch(() => {});
  }
  useEffect(load, []);

  return (
    <Shell title="Sales Voucher (F8)">
      <VoucherForm
        kind="sales"
        partyEndpoint="/masters/customers"
        partyLabel="Customer"
        partyKey="customer_id"
        priceKey="selling_price"
        onSaved={load}
      />

      <h2 className="mb-3 mt-8 text-lg font-bold text-slate-700">Recent Sales</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-green/10 text-left">
            <tr>
              <th className="px-4 py-2">Invoice #</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-right">Invoice</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 && (
              <tr><td className="px-4 py-6 text-center text-slate-400" colSpan={4}>No sales yet.</td></tr>
            )}
            {sales.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium">{s.invoice_number}</td>
                <td className="px-4 py-2 text-slate-500">{s.date?.slice(0, 10)}</td>
                <td className="px-4 py-2 text-right">{inr(s.total)}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    className="btn-blue px-3 py-1 text-xs"
                    onClick={() => downloadPdf(`/vouchers/sales/${s.id}/invoice.pdf`, `${s.invoice_number}.pdf`)}
                  >
                    PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
