import { ColumnDef } from "@tanstack/react-table";
import type { Seemp } from "../../../../types/seemp";

export const columns: ColumnDef<Seemp>[] = [
  {
    accessorKey: "recommendation",
    header: "RECOMMENDATION",
  },
  {
    accessorKey: "costEstimation",
    header: () => <div className="text-center">COST ESTIMATION</div>,
    cell: ({ getValue }) => (
      <div className="text-center">{getValue() as string}</div>
    ),
  },
  {
    accessorKey: "ciiBefore",
    header: () => <div className="text-center">CII BEFORE</div>,
    cell: ({ getValue }) => (
      <div className="text-center">{getValue() as string}</div>
    ),
  },
  {
    accessorKey: "ciiAfter",
    header: () => <div className="text-center">ESTIMATION CII AFTER</div>,
    cell: ({ getValue }) => (
      <div className="text-center">{getValue() as string}</div>
    ),
  },
];
