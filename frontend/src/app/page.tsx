import { modules } from "@/lib/modules";
import { shortcuts } from "@/lib/shortcuts";
import { ModuleGrid } from "@/components/module-grid";
import { ShortcutList } from "@/components/shortcut-list";

export default function Page() {
  return (
    <main style={{ fontFamily: "Inter, system-ui, sans-serif", padding: "32px" }}>
      <h1>ezeERP</h1>
      <p>SmartERP-style billing, inventory, and accounting clone scaffold.</p>
      <section>
        <h2>Modules</h2>
        <ModuleGrid items={modules} />
      </section>
      <section>
        <h2>Keyboard shortcuts</h2>
        <ShortcutList items={shortcuts} />
      </section>
    </main>
  );
}
