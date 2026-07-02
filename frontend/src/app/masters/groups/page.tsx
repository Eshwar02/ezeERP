"use client";
import { MasterCrud, Field } from "@/components/MasterCrud";

type Group = { id: number; name: string; nature: string };

const fields: Field[] = [
  { key: "name", label: "Group Name", required: true },
  { key: "nature", label: "Nature (Asset/Liability/Income/Expense)" },
];

const columns = [
  { accessorKey: "name", header: "Group Name" },
  { accessorKey: "nature", header: "Nature" },
];

export default function Page() {
  return <MasterCrud<Group> title="Group Management (Alt+G)" endpoint="/masters/groups" fields={fields} columns={columns} />;
}
