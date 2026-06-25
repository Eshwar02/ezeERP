"use client";
import { MasterCrud, Field } from "@/components/MasterCrud";
import { inr } from "@/lib/utils";

type Supplier = { id: number; name: string; mobile?: string; gst_number?: string; outstanding_dues: number };

const fields: Field[] = [
  { key: "name", label: "Supplier Name", required: true },
  { key: "gst_number", label: "GST Number" },
  { key: "mobile", label: "Mobile Number" },
  { key: "address", label: "Address" },
];

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "mobile", header: "Mobile" },
  { accessorKey: "gst_number", header: "GST" },
  { accessorKey: "outstanding_dues", header: "Dues", cell: (c: any) => inr(c.getValue()) },
];

export default function Page() {
  return <MasterCrud<Supplier> title="Supplier Management" endpoint="/masters/suppliers" fields={fields} columns={columns} />;
}
