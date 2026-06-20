import { modules } from "@/lib/modules";
import { shortcuts } from "@/lib/shortcuts";

export default function DashboardPage() {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-card">
        <p className="eyebrow">ezeERP</p>
        <h1>Gateway of SmartERP</h1>
        <p className="subtitle">Masters, Transactions, Inventory, Accounting, Banking, GST, Reports, and Administration.</p>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Main Modules</h2>
          <ul className="list">
            {modules.map((module) => (
              <li key={module}>{module}</li>
            ))}
          </ul>
        </div>

        <div className="dashboard-card">
          <h2>Keyboard Shortcuts</h2>
          <ul className="list">
            {shortcuts.map(([key, label]) => (
              <li key={key}>
                <strong>{key}</strong> — {label}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}

