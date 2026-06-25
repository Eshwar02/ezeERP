"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { VoucherForm } from "@/components/VoucherForm";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Purchase = { id: number; bill_number: string; total: number; date: string };

export default function PurchasePage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  function load() {
    api<Purchase[]>("/vouchers/purchases", { company: true }).then(setPurchases).catch(() => {});
  }
  useEffect(load, []);

  return (
    <Shell title="Purchase Voucher (F9)">
      <VoucherForm
        kind="purchase"
        partyEndpoint="/masters/suppliers"
        partyLabel="Supplier"
        partyKey="supplier_id"
        priceKey="purchase_price"
        onSaved={load}
      />

      <h2 className="mb-3 mt-8 text-lg font-bold text-slate-700">Recent Purchases</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-blue/10 text-left">
            <tr>
              <th className="px-4 py-2">Bill #</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 && (
              <tr><td className="px-4 py-6 text-center text-slate-400" colSpan={3}>No purchases yet.</td></tr>
            )}
            {purchases.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium">{p.bill_number}</td>
                <td className="px-4 py-2 text-slate-500">{p.date?.slice(0, 10)}</td>
                <td className="px-4 py-2 text-right">{inr(p.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
