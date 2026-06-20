export function ModuleGrid({ items }: { items: string[] }) {
  return (
    <div style={{ display: "grid", gap: "12px", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
      {items.map((item) => (
        <div
          key={item}
          style={{
            border: "1px solid rgba(229, 238, 251, 0.15)",
            borderRadius: "12px",
            padding: "16px",
            background: "rgba(255, 255, 255, 0.04)"
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

