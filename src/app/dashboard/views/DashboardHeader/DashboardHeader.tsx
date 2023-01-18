import { useEffect, useState } from "react";

import { Button } from "@canonical/react-components";
import pluralize from "pluralize";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom-v5-compat";

import ClearAllForm from "./ClearAllForm";

import SectionHeader from "app/base/components/SectionHeader";
import urls from "app/base/urls";
import { actions as discoveryActions } from "app/store/discovery";
import discoverySelectors from "app/store/discovery/selectors";

export enum Labels {
  ClearAll = "Clear all discoveries",
}

const DashboardHeader = (): JSX.Element => {
  const location = useLocation();
  const dispatch = useDispatch();
  const discoveries = useSelector(discoverySelectors.all);
  const [isFormOpen, setFormOpen] = useState(false);

  useEffect(() => {
    dispatch(discoveryActions.fetch());
  }, [dispatch]);

  let buttons: JSX.Element[] | null = [
    <Button
      data-testid="clear-all"
      disabled={discoveries.length === 0}
      key="clear-all"
      onClick={() => setFormOpen(true)}
    >
      {Labels.ClearAll}
    </Button>,
  ];
  let sidePanelContent: JSX.Element | null = null;
  if (isFormOpen) {
    buttons = null;
    sidePanelContent = (
      <ClearAllForm
        closeForm={() => {
          setFormOpen(false);
        }}
      />
    );
  }

  return (
    <SectionHeader
      buttons={buttons}
      sidePanelContent={sidePanelContent}
      tabLinks={[
        {
          active: location.pathname === urls.dashboard.index,
          component: Link,
          label: pluralize("discovery", discoveries.length, true),
          to: urls.dashboard.index,
        },
        {
          active: location.pathname === urls.dashboard.configuration,
          component: Link,
          label: "Configuration",
          to: urls.dashboard.configuration,
        },
      ]}
      title="Network discovery"
    />
  );
};

export default DashboardHeader;
