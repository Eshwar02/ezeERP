"use client";
import { MasterCrud, Field } from "@/components/MasterCrud";

type StockGroup = { id: number; name: string };

const fields: Field[] = [{ key: "name", label: "Stock Group Name", required: true }];
const columns = [{ accessorKey: "name", header: "Name" }];

export default function Page() {
  return <MasterCrud<StockGroup> title="Stock Groups" endpoint="/masters/stock-groups" fields={fields} columns={columns} />;
}
