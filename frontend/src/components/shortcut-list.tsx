export function ShortcutList({ items }: { items: Array<[string, string]> }) {
  return (
    <ul>
      {items.map(([key, label]) => (
        <li key={key}>
          <strong>{key}</strong> — {label}
        </li>
      ))}
    </ul>
  );
}

