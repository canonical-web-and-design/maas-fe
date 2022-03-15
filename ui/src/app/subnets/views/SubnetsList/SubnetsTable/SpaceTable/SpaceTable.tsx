import { useMemo } from "react";

import ModularTable from "app/base/components/ModularTable";
import {
  CellContents,
  SpaceCellContents,
} from "app/subnets/views/SubnetsList/SubnetsTable/components";
import {
  subnetColumnLabels,
  SubnetsColumns,
} from "app/subnets/views/SubnetsList/SubnetsTable/constants";
import type { SubnetsTableRow } from "app/subnets/views/SubnetsList/SubnetsTable/types";

const SpaceTable = ({ data }: { data: SubnetsTableRow[] }): JSX.Element => {
  return (
    <ModularTable<SubnetsTableRow>
      emptyMsg="Loading..."
      className="subnets-table"
      aria-label="Subnets"
      getCellProps={({ value, column }) => ({
        className: `subnets-table__cell--${column.id}${
          value.isVisuallyHidden ? " u-no-border--top" : ""
        }`,
        role: column.id === "space" ? "rowheader" : undefined,
      })}
      getHeaderProps={(header) => ({
        className: `subnets-table__cell--${header.id}`,
      })}
      getRowProps={(row) => ({
        "aria-label": row.values.space.label,
      })}
      columns={useMemo(
        () => [
          {
            Header: subnetColumnLabels[SubnetsColumns.SPACE],
            accessor: SubnetsColumns.SPACE,
            Cell: SpaceCellContents,
          },
          {
            Header: subnetColumnLabels[SubnetsColumns.VLAN],
            accessor: SubnetsColumns.VLAN,
            Cell: CellContents,
          },
          {
            Header: subnetColumnLabels[SubnetsColumns.DHCP],
            accessor: SubnetsColumns.DHCP,
            Cell: CellContents,
          },
          {
            Header: subnetColumnLabels[SubnetsColumns.FABRIC],
            accessor: SubnetsColumns.FABRIC,
            Cell: CellContents,
          },
          {
            Header: subnetColumnLabels[SubnetsColumns.SUBNET],
            accessor: SubnetsColumns.SUBNET,
            Cell: CellContents,
          },
          {
            Header: subnetColumnLabels[SubnetsColumns.IPS],
            accessor: SubnetsColumns.IPS,
            Cell: CellContents,
          },
        ],
        []
      )}
      data={useMemo(() => data, [data])}
    />
  );
};

export default SpaceTable;
