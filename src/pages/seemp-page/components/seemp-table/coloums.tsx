import { ColumnDef } from "@tanstack/react-table";
import type { Seemp } from "../../../../types/seemp";

export const columns: ColumnDef<Seemp>[] = [
  {
    id: "no",
    header: () => <div className="ml-2 text-center">NO</div>,
    cell: ({ row }) => <div className="text-center ml-2">{row.index + 1}</div>,
  },
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
