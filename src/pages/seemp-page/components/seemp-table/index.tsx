import DataTable from "../../../../components/common/data-table";
import { columns } from "./coloums";
import type { Seemp } from "../../../../types/seemp";

export interface ISeempTableProps {
  data: Array<Seemp> | null;
  pageCount: number;
}

export default function SeempTable({ data }: ISeempTableProps) {
  return (
    <>{data && <DataTable columns={columns} data={data} pageCount={3} />}</>
  );
}
