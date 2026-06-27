"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { AccountingVoucherForm } from "@/components/AccountingVoucherForm";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Voucher = { id: number; number: string; total: number; date: string; narration?: string };

export default function PaymentPage() {
  const [rows, setRows] = useState<Voucher[]>([]);
  function load() {
    api<Voucher[]>("/accounting/vouchers?type=Payment", { company: true }).then(setRows).catch(() => {});
  }
  useEffect(load, []);

  return (
    <Shell title="Payment Voucher (F5)">
      <AccountingVoucherForm voucherType="Payment" onSaved={load} />
      <h2 className="mb-3 mt-8 text-lg font-bold text-slate-700">Recent Payments</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-green/10 text-left">
            <tr>
              <th className="px-4 py-2">Voucher #</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Narration</th>
              <th className="px-4 py-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td className="px-4 py-6 text-center text-slate-400" colSpan={4}>No payments yet.</td></tr>
            )}
            {rows.map((v) => (
              <tr key={v.id} className="border-t border-slate-100">
                <td className="px-4 py-2 font-medium">{v.number}</td>
                <td className="px-4 py-2 text-slate-500">{v.date?.slice(0, 10)}</td>
                <td className="px-4 py-2 text-slate-500">{v.narration || "—"}</td>
                <td className="px-4 py-2 text-right">{inr(v.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
