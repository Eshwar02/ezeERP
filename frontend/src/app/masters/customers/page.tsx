"use client";
import { MasterCrud, Field } from "@/components/MasterCrud";
import { inr } from "@/lib/utils";

type Customer = { id: number; name: string; mobile?: string; gst_number?: string; outstanding_balance: number };

const fields: Field[] = [
  { key: "name", label: "Customer Name", required: true },
  { key: "gst_number", label: "GST Number" },
  { key: "mobile", label: "Mobile Number" },
  { key: "address", label: "Address" },
];

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "mobile", header: "Mobile" },
  { accessorKey: "gst_number", header: "GST" },
  { accessorKey: "outstanding_balance", header: "Outstanding", cell: (c: any) => inr(c.getValue()) },
];

export default function Page() {
  return <MasterCrud<Customer> title="Customer Management" endpoint="/masters/customers" fields={fields} columns={columns} />;
}
