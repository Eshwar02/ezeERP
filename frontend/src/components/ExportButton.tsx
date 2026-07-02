"use client";
import { useState } from "react";
import { downloadPdf } from "@/lib/api";

// Downloads a report's .xlsx export. Reuses the blob downloader in api.ts.
export function ExportButton({ report }: { report: string }) {
  const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true);
    try {
      await downloadPdf(`/reports/${report}/export.xlsx`, `${report}.xlsx`);
    } catch {
      /* surfaced by the browser download failing; keep the UI quiet */
    } finally {
      setBusy(false);
    }
  }
  return (
    <button className="btn-blue px-3 py-1.5 text-xs" onClick={go} disabled={busy}>
      {busy ? "Exporting…" : "Export Excel"}
    </button>
  );
}
