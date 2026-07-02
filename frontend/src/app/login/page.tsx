"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { account, OAuthProvider } from "@/lib/appwrite";
import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function loginWithGoogle() {
    account.createOAuth2Token(
      OAuthProvider.Google,
      `${window.location.origin}/auth/callback`,
      `${window.location.origin}/login`,
    );
  }

  async function loginWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setLoading(true);
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
      <div className="card w-full max-w-sm p-8">
        <div className="mb-2 text-center text-3xl font-black">
          <span className="text-brand-green">eze</span>
          <span className="text-brand-blue">ERP</span>
        </div>
        <p className="mb-6 text-center text-sm text-slate-500">Billing, Inventory &amp; Accounting</p>

        <button
          onClick={loginWithGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {err && <div className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
        <form onSubmit={loginWithEmail}>
          <label className="label">Email</label>
          <input className="input mb-4" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <label className="label">Password</label>
          <input className="input mb-6" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="btn-green w-full" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
