"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { api, setToken } from "@/lib/api";

export default function AuthCallback() {
  const router = useRouter();
  const [err, setErr] = useState("");

  useEffect(() => {
    async function exchange() {
      try {
        const { jwt } = await account.createJWT();
        const res = await api<{ token: string }>("/auth/appwrite", {
          method: "POST",
          body: { jwt },
        });
        setToken(res.token);
        router.replace("/companies");
      } catch (e: any) {
        setErr(e.message || "Auth failed");
      }
    }
    exchange();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-green/10 via-white to-brand-blue/10">
      <div className="card w-full max-w-sm p-8 text-center">
        <div className="mb-4 text-3xl font-black">
          <span className="text-brand-green">eze</span>
          <span className="text-brand-blue">ERP</span>
        </div>
        {err
          ? <p className="text-sm text-red-600">{err}</p>
          : <p className="text-sm text-slate-500">Signing you in…</p>}
      </div>
    </div>
  );
}
