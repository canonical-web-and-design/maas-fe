import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import {
  Col,
  ContextualMenu,
  MainTable,
  Tooltip,
  Icon,
  Row,
  SearchBox,
  Spinner,
} from "@canonical/react-components";
import classNames from "classnames";
import { useSelector, useDispatch } from "react-redux";
import type { Dispatch } from "redux";

import DiscoveryAddForm from "../DiscoveryAddForm";

import DiscoveriesFilterAccordion from "./DiscoveriesFilterAccordion";

import DoubleRow from "app/base/components/DoubleRow";
import TableDeleteConfirm from "app/base/components/TableDeleteConfirm";
import { useWindowTitle } from "app/base/hooks";
import { actions as discoveryActions } from "app/store/discovery";
import discoverySelectors from "app/store/discovery/selectors";
import type { Discovery } from "app/store/discovery/types";
import { DiscoveryMeta } from "app/store/discovery/types";
import type { RootState } from "app/store/root/types";

enum ExpandedType {
  ADD = "add",
  DELETE = "delete",
}

type ExpandedRow = {
  id: Discovery[DiscoveryMeta.PK];
  type: ExpandedType;
};

const generateRows = (
  discoveries: Discovery[],
  expandedRow: ExpandedRow | null,
  setExpandedRow: (expandedRow: ExpandedRow | null) => void,
  saved: boolean,
  saving: boolean,
  dispatch: Dispatch
) =>
  discoveries.map((discovery) => {
    const isExpanded = expandedRow?.id === discovery[DiscoveryMeta.PK];
    const name = discovery.hostname || "Unknown";
    let expandedContent: ReactNode = null;
    if (isExpanded && expandedRow?.type === ExpandedType.ADD) {
      expandedContent = (
        <DiscoveryAddForm
          data-test="add-discovery"
          discovery={discovery}
          onClose={() => {
            setExpandedRow(null);
          }}
        />
      );
    } else if (isExpanded && expandedRow?.type === ExpandedType.DELETE) {
      expandedContent = (
        <TableDeleteConfirm
          data-test="delete-discovery"
          deleted={saved}
          deleting={saving}
          modelName={name}
          modelType="discovery"
          onClose={() => {
            setExpandedRow(null);
          }}
          onConfirm={() => {
            dispatch(
              discoveryActions.delete({
                ip: discovery.ip,
                mac: discovery.mac_address,
              })
            );
          }}
          sidebar={false}
        />
      );
    }
    return {
      key: discovery[DiscoveryMeta.PK],
      className: classNames("p-table__row", {
        "is-active": isExpanded,
      }),
      columns: [
        {
          content: (
            <>
              {name}
              {discovery.is_external_dhcp ? (
                <Tooltip
                  message="This device is providing DHCP"
                  className="u-nudge-right"
                  position="top-center"
                >
                  <Icon name="information" />
                </Tooltip>
              ) : null}
            </>
          ),
        },
        {
          content: (
            <DoubleRow
              primary={discovery.mac_address}
              secondary={discovery.mac_organization || "Unknown"}
            />
          ),
        },
        {
          content: discovery.ip,
        },
        {
          content: discovery.observer_hostname,
        },
        {
          content: <div className="u-truncate">{discovery.last_seen}</div>,
        },
        {
          content: (
            <ContextualMenu
              data-test="row-menu"
              hasToggleIcon={true}
              links={[
                {
                  children: "Add discovery...",
                  "data-test": "add-discovery-link",
                  onClick: () => {
                    setExpandedRow({
                      id: discovery[DiscoveryMeta.PK],
                      type: ExpandedType.ADD,
                    });
                  },
                },
                {
                  children: "Delete discovery...",
                  "data-test": "delete-discovery-link",
                  onClick: () => {
                    setExpandedRow({
                      id: discovery[DiscoveryMeta.PK],
                      type: ExpandedType.DELETE,
                    });
                  },
                },
              ]}
              toggleAppearance="base"
              toggleClassName="row-menu-toggle u-no-margin--bottom"
              toggleDisabled={isExpanded}
            />
          ),
          className: "u-align--right",
        },
      ],
      sortData: {
        hostname: discovery.hostname,
        ip: discovery.ip,
        lastSeen: discovery.last_seen,
        macAddress: discovery.mac_address,
        rack: discovery.observer_hostname,
      },
      expanded: isExpanded,
      expandedContent,
    };
  });

const DiscoveriesList = (): JSX.Element => {
  const dispatch = useDispatch();
  const [searchString, setSearchString] = useState("");
  const [expandedRow, setExpandedRow] = useState<ExpandedRow | null>(null);
  const discoveries = useSelector((state: RootState) =>
    discoverySelectors.search(state, searchString)
  );
  const loading = useSelector(discoverySelectors.loading);
  const loaded = useSelector(discoverySelectors.loaded);
  const saving = useSelector(discoverySelectors.saving);
  const saved = useSelector(discoverySelectors.saved);

  useWindowTitle("Dashboard");

  useEffect(() => {
    dispatch(discoveryActions.fetch());
  }, [dispatch]);

  if (loading) {
    return <Spinner />;
  }

  if (loaded && !searchString && discoveries.length === 0) {
    return <div data-test="no-discoveries">No new discoveries.</div>;
  }

  const headers = [
    {
      content: "Name",
      sortKey: "hostname",
    },
    {
      content: "Mac address",
      sortKey: "macAddress",
    },
    {
      content: "IP",
      sortKey: "ip",
    },
    {
      content: "Rack",
      sortKey: "rack",
    },
    {
      content: "Last seen",
      sortKey: "lastSeen",
    },
    {
      content: "Action",
      className: "u-align--right",
    },
  ];

  return (
    <>
      <Row>
        <Col size={3}>
          <DiscoveriesFilterAccordion
            searchText={searchString}
            setSearchText={setSearchString}
          />
        </Col>
        <Col size={9}>
          <SearchBox
            data-test="discoveries-search"
            externallyControlled
            onChange={setSearchString}
            value={searchString}
          />
        </Col>
      </Row>
      <MainTable
        className="p-table--network-discoveries p-table-expanding--light"
        data-test="discoveries-table"
        defaultSort="lastSeen"
        defaultSortDirection="ascending"
        expanding
        headers={headers}
        rows={generateRows(
          discoveries,
          expandedRow,
          setExpandedRow,
          saved,
          saving,
          dispatch
        )}
        sortable
        emptyStateMsg="No discoveries match the search criteria."
      />
    </>
  );
};

export default DiscoveriesList;
