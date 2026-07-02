"use client";
import { MasterCrud, Field } from "@/components/MasterCrud";

type Unit = { id: number; name: string };

const fields: Field[] = [{ key: "name", label: "Unit Name (PCS/KG/LTR…)", required: true }];
const columns = [{ accessorKey: "name", header: "Unit" }];

export default function Page() {
  return <MasterCrud<Unit> title="Unit Management (Alt+U)" endpoint="/masters/units" fields={fields} columns={columns} />;
}
