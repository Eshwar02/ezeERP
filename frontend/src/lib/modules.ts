export type ModuleLink = { label: string; href: string };

export const modules: ModuleLink[] = [
  { label: "Masters", href: "/masters/ledgers" },
  { label: "Transactions", href: "/vouchers/sales" },
  { label: "Inventory", href: "/masters/stock-items" },
  { label: "Accounting", href: "/vouchers/journal" },
  { label: "Banking", href: "/vouchers/contra" },
  { label: "GST", href: "/masters/customers" },
  { label: "Reports", href: "/vouchers/receipt" },
  { label: "Administration", href: "/companies" },
];
