import { ColumnDef } from "@tanstack/react-table";
import type { Seemp } from "../../../../types/seemp";

export const columns: ColumnDef<Seemp>[] = [
  {
    accessorKey: "recommendation",
    header: "RECOMMENDATION",
  },
  {
    accessorKey: "costEstimation",
    header: "COST ESTIMATION",
  },
  {
    accessorKey: "ciiBefore",
    header: "CI BEFORE",
  },
  {
    accessorKey: "ciiAfter",
    header: "CI AFTER",
  },
];
