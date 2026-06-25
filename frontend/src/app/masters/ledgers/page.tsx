"use client";
import { MasterCrud, Field } from "@/components/MasterCrud";
import { inr } from "@/lib/utils";

type Ledger = { id: number; name: string; ledger_type: string; balance: number };

const fields: Field[] = [
  { key: "name", label: "Ledger Name", required: true },
  { key: "ledger_type", label: "Type (Customer/Supplier/Bank/Cash)" },
  { key: "opening_balance", label: "Opening Balance", type: "number" },
];

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "ledger_type", header: "Type" },
  { accessorKey: "balance", header: "Balance", cell: (c: any) => inr(c.getValue()) },
];

export default function Page() {
  return <MasterCrud<Ledger> title="Ledger Management" endpoint="/masters/ledgers" fields={fields} columns={columns} />;
}
