"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function upd(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api<{ token: string }>("/auth/register", { method: "POST", body: form });
      setToken(res.token);
      router.push("/companies");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-blue/10 via-white to-brand-green/10">
      <form onSubmit={onSubmit} className="card w-full max-w-sm p-8">
        <div className="mb-6 text-center text-3xl font-black">
          <span className="text-brand-green">eze</span>
          <span className="text-brand-blue">ERP</span>
        </div>
        {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
        <label className="label">Name</label>
        <input className="input mb-4" value={form.name} onChange={(e) => upd("name", e.target.value)} />
        <label className="label">Email</label>
        <input className="input mb-4" type="email" value={form.email} onChange={(e) => upd("email", e.target.value)} required />
        <label className="label">Password</label>
        <input className="input mb-6" type="password" value={form.password} onChange={(e) => upd("password", e.target.value)} required />
        <button className="btn-blue w-full" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          Have an account?{" "}
          <Link href="/login" className="text-brand-blue hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}
