import Link from "next/link";

export default function Page() {
  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand">
          <p className="eyebrow">ezeERP</p>
          <h1>Login</h1>
          <p className="subtitle">
            SmartERP-style billing, inventory, accounting, and business management platform.
          </p>
        </div>

        <form className="login-form">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" placeholder="Enter email address" />

          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" placeholder="Enter password" />

          <div className="form-meta">
            <span>Keyboard-first workflow</span>
            <span>Press ENTER to continue</span>
          </div>

          <Link className="primary-button" href="/dashboard">
            Login
          </Link>
        </form>

        <p className="helper">
          Email and password login • Company Selection after login • F1 for Company Selection • CTRL + H for Dashboard
        </p>
      </section>
    </main>
  );
}

