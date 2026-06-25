// Thin API client for the ezeERP Flask backend.
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("eze_token");
}
export function getCompanyId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("eze_company");
}
export function setToken(t: string) {
  localStorage.setItem("eze_token", t);
}
export function setCompanyId(id: string) {
  localStorage.setItem("eze_company", id);
}
export function logout() {
  localStorage.removeItem("eze_token");
  localStorage.removeItem("eze_company");
}

type Opts = { method?: string; body?: unknown; company?: boolean };

export async function api<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (opts.company) {
    const cid = getCompanyId();
    if (cid) headers["X-Company-Id"] = cid;
  }
  const res = await fetch(`${BASE}${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// For binary downloads (invoice PDF) with the company header.
export function downloadUrl(path: string): string {
  return `${BASE}${path}`;
}
export async function downloadPdf(path: string, filename: string) {
  const headers: Record<string, string> = {};
  const token = getToken();
  const cid = getCompanyId();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (cid) headers["X-Company-Id"] = cid;
  const res = await fetch(`${BASE}${path}`, { headers });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
