import DataTable from "../../../../components/common/data-table";
import { columns } from "./coloums";
import type { Seemp } from "../../../../types/seemp";

export interface ISeempTableProps {
  seemp: Array<Seemp>;
}

export default function SeempTable({ seemp }: ISeempTableProps) {
  return (
    <>{seemp && <DataTable columns={columns} data={seemp} pageCount={2} />}</>
  );
}
