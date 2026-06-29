import Link from "next/link";

export default function Page() {
  return (
    <main className="auth-bg flex min-h-screen items-center justify-center p-4">
      <section className="card w-full max-w-sm p-8">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">ezeERP</p>
          <h1 className="mt-1 text-3xl font-black">
            <span className="text-brand-green">eze</span>
            <span className="text-brand-blue">ERP</span>
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            SmartERP-style billing, inventory, accounting, and business management platform.
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" className="input" placeholder="Enter email address" />
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" name="password" type="password" className="input" placeholder="Enter password" />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Keyboard-first workflow</span>
            <span>Press ENTER to continue</span>
          </div>

          <Link className="btn-green w-full" href="/dashboard">
            Login
          </Link>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-slate-400">
          Email and password login • Company Selection after login • F1 for Company Selection • CTRL + H for Dashboard
        </p>
      </section>
    </main>
  );
}
