export default function LogoPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        {/* Icon mark */}
        <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="96" height="96" rx="22" fill="url(#logo-bg)" />
          <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle"
            fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="44" fill="white">
            e
          </text>
          <defs>
            <linearGradient id="logo-bg" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
              <stop stopColor="#50C69E" />
              <stop offset="1" stopColor="#3574B9" />
            </linearGradient>
          </defs>
        </svg>

        {/* Wordmark */}
        <div className="text-center">
          <div className="text-8xl font-black tracking-tight leading-none">
            <span className="text-brand-green">eze</span>
            <span className="text-brand-blue">ERP</span>
          </div>
          <p className="mt-4 text-2xl font-medium text-slate-400 tracking-wide">
            Billing, Inventory &amp; Accounting
          </p>
        </div>
      </div>
    </div>
  );
}
