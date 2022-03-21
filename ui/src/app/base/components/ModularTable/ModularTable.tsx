import type { ReactNode, HTMLProps } from "react";

import type { PropsWithSpread } from "@canonical/react-components";
import Icon from "@canonical/react-components/dist/components/Icon";
import Table from "@canonical/react-components/dist/components/Table";
import TableCell from "@canonical/react-components/dist/components/TableCell";
import TableHeader from "@canonical/react-components/dist/components/TableHeader";
import TableRow from "@canonical/react-components/dist/components/TableRow";
import { useTable } from "react-table";
import type {
  Column,
  UseTableOptions,
  Cell,
  Row,
  HeaderGroup,
  TableHeaderProps,
  TableRowProps,
  TableCellProps,
} from "react-table";

export type Props<D extends Record<string, unknown>> = PropsWithSpread<
  {
    /**
     * The columns of the table.
     */
    columns: Column<D>[];
    /**
     * The data of the table.
     */
    data: D[];
    /**
     * A message to display if data is empty.
     */
    emptyMsg?: string;
    /**
     * Optional extra row to display underneath the main table content.
     */
    footer?: ReactNode;
    getHeaderProps?: (
      header: HeaderGroup<D>
    ) => Partial<TableHeaderProps & HTMLProps<HTMLTableHeaderCellElement>>;
    getRowProps?: (
      row: Row<D>
    ) => Partial<TableRowProps & HTMLProps<HTMLTableRowElement>>;
    getCellProps?: (
      cell: Cell<D>
    ) => Partial<TableCellProps & HTMLProps<HTMLTableCellElement>>;
    getRowId?: UseTableOptions<D>["getRowId"];
  },
  HTMLProps<HTMLTableElement>
>;

function ModularTable<D extends Record<string, unknown>>({
  data,
  columns,
  emptyMsg,
  footer,
  getHeaderProps,
  getRowProps,
  getCellProps,
  getRowId,
  ...props
}: Props<D>): JSX.Element {
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable<D>({ columns, data, getRowId: getRowId || undefined });

  const showEmpty: boolean = !!emptyMsg && (!rows || rows.length === 0);

  return (
    <Table {...getTableProps()} {...props}>
      <thead>
        {headerGroups.map((headerGroup) => (
          <TableRow {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <TableHeader
                {...column.getHeaderProps([
                  {
                    className: column.className,
                  },
                  {
                    className: column.getCellIcon
                      ? "p-table__cell--icon-placeholder"
                      : "",
                  },
                  { ...getHeaderProps?.(column) },
                ])}
              >
                {column.render("Header")}
              </TableHeader>
            ))}
          </TableRow>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          // This function is responsible for lazily preparing a row for rendering.
          // Any row that you intend to render in your table needs to be passed to this function before every render.
          // see: https://react-table.tanstack.com/docs/api/useTable#instance-properties
          prepareRow(row);
          return (
            <TableRow {...row.getRowProps(getRowProps?.(row))}>
              {row.cells.map((cell) => {
                const hasColumnIcon = cell.column.getCellIcon;
                const iconName =
                  hasColumnIcon && cell.column.getCellIcon?.(cell);

                return (
                  <TableCell
                    {...cell.getCellProps([
                      {
                        className: cell.column.className,
                      },
                      {
                        className: hasColumnIcon
                          ? "p-table__cell--icon-placeholder"
                          : "",
                      },
                      { ...getCellProps?.(cell) },
                    ])}
                  >
                    {iconName && <Icon name={iconName} />}
                    {cell.render("Cell")}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })}
        {showEmpty && (
          <TableRow>
            <TableCell colSpan={columns.length}>{emptyMsg}</TableCell>
          </TableRow>
        )}
        {footer && (
          <TableRow>
            <TableCell colSpan={columns.length}>{footer}</TableCell>
          </TableRow>
        )}
      </tbody>
    </Table>
  );
}

export default ModularTable;
