import { modules } from "@/lib/modules";
import { shortcuts } from "@/lib/shortcuts";

export default function DashboardPage() {
  return (
    <main className="auth-bg min-h-screen p-6">
      <section className="card mx-auto mb-6 max-w-5xl p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">ezeERP</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900">Gateway of SmartERP</h1>
        <p className="mt-2 text-sm text-slate-500">
          Masters, Transactions, Inventory, Accounting, Banking, GST, Reports, and Administration.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Main Modules</h2>
          <ul className="grid grid-cols-2 gap-2">
            {modules.map((module) => (
              <li
                key={module}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700"
              >
                {module}
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Keyboard Shortcuts</h2>
          <ul className="space-y-2">
            {shortcuts.map(([key, label]) => (
              <li key={key} className="flex items-center justify-between text-sm text-slate-600">
                <span className="kbd">{key}</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
