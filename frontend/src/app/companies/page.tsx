"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, setCompanyId } from "@/lib/api";

type Company = {
  id: number; name: string; gst_number?: string; state?: string;
  address?: string; financial_year?: string; contact_info?: string;
};

const EMPTY = { name: "", gst_number: "", state: "", address: "", financial_year: "", contact_info: "" };

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [err, setErr] = useState("");

  async function load() {
    try {
      setCompanies(await api<Company[]>("/companies"));
    } catch (e: any) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    load();
  }, [router]);

  function select(c: Company) {
    setCompanyId(String(c.id));
    router.push("/dashboard");
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      await api("/companies", { method: "POST", body: form });
      setForm({ ...EMPTY });
      load();
    } catch (e: any) {
      setErr(e.message);
    }
  }

  async function remove(id: number) {
    await api(`/companies/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-1 text-2xl font-black">
        <span className="text-brand-green">eze</span><span className="text-brand-blue">ERP</span>
        <span className="ml-2 text-slate-700">— Select Company</span>
      </h1>
      <p className="mb-6 text-sm text-slate-500">Each account manages up to 5 companies. <span className="kbd">F1</span></p>
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}

      <div className="grid gap-3 md:grid-cols-2">
        {companies.map((c) => (
          <div key={c.id} className="card flex items-center justify-between p-4">
            <div className="cursor-pointer" onClick={() => select(c)}>
              <div className="font-semibold text-slate-800">{c.name}</div>
              <div className="text-xs text-slate-500">
                {c.state || "—"} {c.gst_number ? `· ${c.gst_number}` : ""}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-blue px-3 py-1 text-xs" onClick={() => select(c)}>Open</button>
              <button className="btn-ghost px-3 py-1 text-xs" onClick={() => remove(c.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {companies.length < 5 && (
        <form onSubmit={create} className="card mt-8 grid gap-4 p-6 md:grid-cols-2">
          <h2 className="md:col-span-2 text-lg font-bold text-brand-green">Create Company</h2>
          <div>
            <label className="label">Company Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">GST Number</label>
            <input className="input" value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div>
            <label className="label">Financial Year</label>
            <input className="input" value={form.financial_year} onChange={(e) => setForm({ ...form, financial_year: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <button className="btn-green md:col-span-2">Create Company</button>
        </form>
      )}
    </div>
  );
}
