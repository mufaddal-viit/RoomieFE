import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

type SummaryTableHeader = { label: string; className?: string };
type SummaryTableCell = { content: ReactNode; className?: string };
type SummaryTableRow = { key: string; cells: SummaryTableCell[] };

type SummaryTableProps = {
  headers: SummaryTableHeader[];
  rows: SummaryTableRow[];
  emptyMessage: string;
};

const SummaryTable = ({ headers, rows, emptyMessage }: SummaryTableProps) => (
  <Table>
    <TableHeader>
      <TableRow>
        {headers.map((header) => (
          <TableHead key={header.label} className={header.className}>
            {header.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((row) => (
        <TableRow key={row.key}>
          {row.cells.map((cell, index) => (
            <TableCell key={`${row.key}-${index}`} className={cell.className}>
              {cell.content}
            </TableCell>
          ))}
        </TableRow>
      ))}
      {rows.length === 0 && (
        <TableRow>
          <TableCell colSpan={headers.length} className="text-center text-sm text-muted-foreground">
            {emptyMessage}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
);

export default SummaryTable;