"use client";
import { useEffect, useState } from "react";
import { Shell } from "@/components/Shell";
import { api } from "@/lib/api";
import { inr } from "@/lib/utils";

type Data = {
  gst_collected: number; gst_paid: number; net_gst_payable: number;
  cgst_collected: number; sgst_collected: number;
  cgst_paid: number; sgst_paid: number;
  igst_collected: number; igst_paid: number;
};

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="card p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-black ${color ?? "text-slate-800"}`}>{inr(value)}</p>
    </div>
  );
}

export default function GstReportPage() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api<Data>("/reports/gst", { company: true }).then(setData).catch((e) => setErr(e.message));
  }, []);

  return (
    <Shell title="GST Report (Alt+X)">
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      {!data ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Stat label="GST Collected (Output)" value={data.gst_collected} color="text-brand-green" />
            <Stat label="GST Paid (Input)" value={data.gst_paid} color="text-brand-blue" />
            <Stat label="Net GST Payable" value={data.net_gst_payable} color={data.net_gst_payable >= 0 ? "text-red-500" : "text-brand-green"} />
          </div>

          <div className="card overflow-hidden">
            <div className="bg-brand-blue/10 px-4 py-2">
              <h2 className="font-semibold text-slate-700">Tax Breakdown</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr className="border-b border-slate-100">
                  <th className="px-4 py-2 text-slate-500">Tax Type</th>
                  <th className="px-4 py-2 text-right text-brand-green">Collected (Sales)</th>
                  <th className="px-4 py-2 text-right text-brand-blue">Paid (Purchases)</th>
                  <th className="px-4 py-2 text-right text-slate-700">Net</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "CGST", collected: data.cgst_collected, paid: data.cgst_paid },
                  { label: "SGST", collected: data.sgst_collected, paid: data.sgst_paid },
                  { label: "IGST", collected: data.igst_collected, paid: data.igst_paid },
                ].map((row) => (
                  <tr key={row.label} className="border-t border-slate-100 hover:bg-brand-green/5">
                    <td className="px-4 py-2 font-medium text-slate-800">{row.label}</td>
                    <td className="px-4 py-2 text-right text-brand-green">{inr(row.collected)}</td>
                    <td className="px-4 py-2 text-right text-brand-blue">{inr(row.paid)}</td>
                    <td className="px-4 py-2 text-right font-medium">{inr(row.collected - row.paid)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                  <td className="px-4 py-2 text-slate-800">Total</td>
                  <td className="px-4 py-2 text-right text-brand-green">{inr(data.gst_collected)}</td>
                  <td className="px-4 py-2 text-right text-brand-blue">{inr(data.gst_paid)}</td>
                  <td className={`px-4 py-2 text-right ${data.net_gst_payable >= 0 ? "text-red-500" : "text-brand-green"}`}>
                    {inr(data.net_gst_payable)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </Shell>
  );
}
