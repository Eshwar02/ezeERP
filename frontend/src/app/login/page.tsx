"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await api<{ token: string }>("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setToken(res.token);
      router.push("/companies");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-green/10 via-white to-brand-blue/10">
      <form onSubmit={onSubmit} className="card w-full max-w-sm p-8">
        <div className="mb-6 text-center text-3xl font-black">
          <span className="text-brand-green">eze</span>
          <span className="text-brand-blue">ERP</span>
        </div>
        <p className="mb-6 text-center text-sm text-slate-500">
          Billing, Inventory &amp; Accounting
        </p>
        {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
        <label className="label">Email</label>
        <input className="input mb-4" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label className="label">Password</label>
        <input className="input mb-6" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className="btn-green w-full" disabled={loading}>
          {loading ? "Signing in…" : "Login"}
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
          No account?{" "}
          <Link href="/register" className="text-brand-blue hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
}
