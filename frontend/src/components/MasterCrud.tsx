"use client";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Shell } from "@/components/Shell";
import { DataTable } from "@/components/DataTable";
import { api } from "@/lib/api";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "number";
  required?: boolean;
};

// Generic create + list screen for any company-scoped master entity.
export function MasterCrud<T extends { id: number }>({
  title,
  endpoint,
  fields,
  columns,
}: {
  title: string;
  endpoint: string; // e.g. "/masters/ledgers"
  fields: Field[];
  columns: ColumnDef<T, any>[];
}) {
  const [rows, setRows] = useState<T[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    try {
      setRows(await api<T[]>(endpoint, { company: true }));
    } catch (e: any) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setMsg("");
    const body: Record<string, any> = {};
    for (const f of fields) {
      let v = form[f.key];
      if (f.type === "number") v = v === "" || v === undefined ? 0 : Number(v);
      body[f.key] = v ?? "";
    }
    try {
      await api(endpoint, { method: "POST", body, company: true });
      setForm({});
      setMsg(`${title} saved.`);
      load();
    } catch (e: any) {
      setErr(e.message);
    }
  }

  return (
    <Shell title={title}>
      {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      {msg && <div className="mb-4 rounded bg-brand-green/10 px-3 py-2 text-sm text-brand-greenDark">{msg}</div>}

      <form onSubmit={create} className="card mb-6 grid gap-4 p-5 md:grid-cols-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="label">{f.label}{f.required ? " *" : ""}</label>
            <input
              className="input"
              type={f.type === "number" ? "number" : "text"}
              step="any"
              value={form[f.key] ?? ""}
              required={f.required}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            />
          </div>
        ))}
        <div className="flex items-end">
          <button className="btn-green w-full">Save</button>
        </div>
      </form>

      <DataTable columns={columns} data={rows} />
    </Shell>
  );
}
