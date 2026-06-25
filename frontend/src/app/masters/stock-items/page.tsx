"use client";
import { MasterCrud, Field } from "@/components/MasterCrud";
import { inr } from "@/lib/utils";

type Item = {
  id: number; name: string; sku?: string; hsn_code?: string;
  selling_price: number; quantity: number; gst_percentage: number;
};

const fields: Field[] = [
  { key: "name", label: "Item Name", required: true },
  { key: "sku", label: "SKU" },
  { key: "hsn_code", label: "HSN Code" },
  { key: "purchase_price", label: "Purchase Price", type: "number" },
  { key: "selling_price", label: "Selling Price", type: "number" },
  { key: "quantity", label: "Opening Qty", type: "number" },
  { key: "gst_percentage", label: "GST %", type: "number" },
  { key: "reorder_level", label: "Reorder Level", type: "number" },
];

const columns = [
  { accessorKey: "name", header: "Item" },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "hsn_code", header: "HSN" },
  { accessorKey: "quantity", header: "Qty" },
  { accessorKey: "selling_price", header: "Sell", cell: (c: any) => inr(c.getValue()) },
  { accessorKey: "gst_percentage", header: "GST%" },
];

export default function Page() {
  return <MasterCrud<Item> title="Stock Items" endpoint="/masters/stock-items" fields={fields} columns={columns} />;
}
