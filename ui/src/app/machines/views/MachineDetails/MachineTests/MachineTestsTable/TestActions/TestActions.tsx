import type { ContextualMenuProps } from "@canonical/react-components";
import type { LinkProps } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";

import type { SetExpanded } from "../MachineTestsTable";
import { ScriptResultAction } from "../MachineTestsTable";

import TableMenu from "app/base/components/TableMenu";
import { useSendAnalytics } from "app/base/hooks";
import type { DataTestElement } from "app/base/types";
import type { ScriptResult } from "app/store/scriptresult/types";
import { scriptResultInProgress } from "app/store/scriptresult/utils";

type Props = {
  scriptResult: ScriptResult;
  setExpanded: SetExpanded;
};

type LinkWithDataTest = DataTestElement<LinkProps>;

const TestActions = ({ scriptResult, setExpanded }: Props): JSX.Element => {
  const sendAnalytics = useSendAnalytics();
  const location = useLocation();
  const canViewDetails = !scriptResultInProgress(scriptResult.status);
  const hasMetrics = scriptResult.results.length > 0;
  const links: ContextualMenuProps<LinkWithDataTest>["links"] = [];

  if (canViewDetails) {
    const urlStem = location?.pathname?.split("/")?.[3] || "testing";
    links.push({
      children: "View details...",
      "data-test": "view-details",
      element: Link,
      to: `${urlStem}/${scriptResult.id}/details`,
    });
  }

  links.push({
    children: "View previous tests...",
    "data-test": "view-previous-tests",
    onClick: () => {
      setExpanded({
        id: scriptResult.id,
        content: ScriptResultAction.VIEW_PREVIOUS_TESTS,
      });
      sendAnalytics(
        "Machine testing",
        "View testing script history",
        "View previous tests"
      );
    },
  });

  if (hasMetrics) {
    links.push({
      children: "View metrics...",
      "data-test": "view-metrics",
      onClick: () => {
        setExpanded({
          id: scriptResult.id,
          content: ScriptResultAction.VIEW_METRICS,
        });
        sendAnalytics(
          "Machine testing",
          "View testing script metrics",
          "View metrics"
        );
      },
    });
  }

  return <TableMenu links={links} position="right" title="Take action:" />;
};

export default TestActions;
