import { useState } from "react";

import { Input, MainTable, Tooltip } from "@canonical/react-components";
import { useDispatch } from "react-redux";

import ScriptRunTime from "./ScriptRunTime";
import TestActions from "./TestActions";
import TestHistory from "./TestHistory";
import TestMetrics from "./TestMetrics";

import ScriptStatus from "app/base/components/ScriptStatus";
import TableHeader from "app/base/components/TableHeader";
import { useSendAnalytics } from "app/base/hooks";
import type { TSFixMe } from "app/base/types";
import { actions as machineActions } from "app/store/machine";
import type { Machine } from "app/store/machine/types";
import type { ScriptResult } from "app/store/scriptresult/types";
import { ScriptResultType } from "app/store/scriptresult/types";
import { canBeSuppressed } from "app/store/scriptresult/utils";

export enum ScriptResultAction {
  VIEW_METRICS = "viewMetrics",
  VIEW_PREVIOUS_TESTS = "viewPreviousTests",
}

export type Expanded = {
  id: ScriptResult["id"];
  content: ScriptResultAction;
};

export type SetExpanded = (expanded: Expanded) => void;

type Props = {
  machineId: Machine["system_id"];
  scriptResults: ScriptResult[];
};

const MachineTestsTable = ({
  machineId,
  scriptResults,
}: Props): JSX.Element => {
  const dispatch = useDispatch();
  const sendAnalytics = useSendAnalytics();
  const [expanded, setExpanded] = useState<Expanded | null>(null);
  const closeExpanded = () => setExpanded(null);
  const containsTesting = scriptResults.some(
    (result) => result.result_type === ScriptResultType.TESTING
  );
  const rows: TSFixMe = [];

  scriptResults.forEach((result) => {
    const isExpanded = expanded?.id === result.id;
    const isSuppressible = canBeSuppressed(result);

    rows.push({
      expanded: isExpanded,
      className: isExpanded ? "p-table__row is-active" : null,
      columns: [
        ...(containsTesting
          ? [
              {
                className: "suppress-col",
                content: (
                  <Tooltip
                    data-test="suppress-tooltip"
                    message={
                      isSuppressible
                        ? null
                        : "Only failed testing scripts can be suppressed."
                    }
                  >
                    <Input
                      checked={result.suppressed}
                      data-test="suppress-script-results"
                      disabled={!isSuppressible}
                      id={`suppress-${result.id}`}
                      label=" "
                      labelClassName="is-inline-label"
                      onChange={() => {
                        if (result.suppressed) {
                          dispatch(
                            machineActions.unsuppressScriptResults(machineId, [
                              result,
                            ])
                          );
                          sendAnalytics(
                            "Machine testing",
                            "Unsuppress script result failure",
                            "Unsuppress"
                          );
                        } else {
                          dispatch(
                            machineActions.suppressScriptResults(machineId, [
                              result,
                            ])
                          );
                          sendAnalytics(
                            "Machine testing",
                            "Suppress script result failure",
                            "Suppress"
                          );
                        }
                      }}
                      type="checkbox"
                    />
                  </Tooltip>
                ),
              },
            ]
          : []),
        {
          className: "name-col",
          content: result.name,
        },
        {
          className: "tags-col",
          content: result.tags,
        },
        {
          className: "result-col",
          content: (
            <ScriptStatus status={result.status}>
              {result.status_name}
            </ScriptStatus>
          ),
        },
        {
          className: "date-col",
          content: result.updated,
        },
        {
          className: "runtime-col",
          content: <ScriptRunTime scriptResult={result} />,
        },
        {
          className: "actions-col u-align--right",
          content: (
            <TestActions scriptResult={result} setExpanded={setExpanded} />
          ),
        },
      ],
      expandedContent: isExpanded ? (
        <div className="u-flex--grow">
          {expanded?.content === ScriptResultAction.VIEW_METRICS && (
            <TestMetrics close={closeExpanded} scriptResult={result} />
          )}
          {expanded?.content === ScriptResultAction.VIEW_PREVIOUS_TESTS && (
            <TestHistory close={closeExpanded} scriptResult={result} />
          )}
        </div>
      ) : null,
      key: result.id,
      sortData: {
        name: result.name,
        date: result.updated,
      },
    });
  });

  return (
    <>
      <MainTable
        expanding
        className="p-table-expanding--light p-table--machine-tests-table"
        headers={[
          ...(containsTesting
            ? [
                {
                  className: "suppress-col",
                  content: <TableHeader>Suppress</TableHeader>,
                },
              ]
            : []),
          {
            className: "name-col",
            content: <TableHeader>Name</TableHeader>,
          },
          {
            className: "tags-col",
            content: <TableHeader>Tags</TableHeader>,
          },
          {
            className: "result-col",
            content: (
              <TableHeader className="p-double-row__header-spacer">
                Result
              </TableHeader>
            ),
          },
          {
            className: "date-col",
            content: <TableHeader>Date</TableHeader>,
          },
          {
            className: "runtime-col",
            content: <TableHeader>Runtime</TableHeader>,
          },
          {
            className: "actions-col u-align--right",
            content: <TableHeader>Actions</TableHeader>,
          },
        ]}
        rows={rows}
      />
    </>
  );
};

export default MachineTestsTable;
