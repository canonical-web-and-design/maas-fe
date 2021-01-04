import { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { Redirect, Route, Switch } from "react-router-dom";

import MachineHeader from "./MachineHeader";
import MachineNetwork from "./MachineNetwork";
import NetworkNotifications from "./MachineNetwork/NetworkNotifications";
import MachinePCIDevices from "./MachinePCIDevices";
import MachineStorage from "./MachineStorage";
import StorageNotifications from "./MachineStorage/StorageNotifications";
import type { SelectedAction } from "./MachineSummary";
import MachineSummary from "./MachineSummary";
import SummaryNotifications from "./MachineSummary/SummaryNotifications";
import MachineTests from "./MachineTests";
import MachineUSBDevices from "./MachineUSBDevices";

import Section from "app/base/components/Section";
import type { RouteParams } from "app/base/types";
import { actions as machineActions } from "app/store/machine";
import machineSelectors from "app/store/machine/selectors";
import type { RootState } from "app/store/root/types";

const MachineDetails = (): JSX.Element => {
  const dispatch = useDispatch();
  const params = useParams<RouteParams>();
  const { id } = params;
  const machine = useSelector((state: RootState) =>
    machineSelectors.getById(state, id)
  );
  const machinesLoaded = useSelector(machineSelectors.loaded);
  const [selectedAction, setSelectedAction] = useState<SelectedAction | null>(
    null
  );

  useEffect(() => {
    dispatch(machineActions.get(id));
    // Set machine as active to ensure all machine data is sent from the server.
    dispatch(machineActions.setActive(id));

    // Unset active machine on cleanup.
    return () => {
      dispatch(machineActions.setActive(null));
      // Clean up any machine errors etc. when closing the details.
      dispatch(machineActions.cleanup());
    };
  }, [dispatch, id]);

  // If machine has been deleted, redirect to machine list.
  if (machinesLoaded && !machine) {
    return <Redirect to="/machines" />;
  }

  return (
    <Section
      header={
        <MachineHeader
          selectedAction={selectedAction}
          setSelectedAction={setSelectedAction}
        />
      }
      headerClassName="u-no-padding--bottom"
    >
      {machine && (
        <Switch>
          <Route exact path="/machine/:id/summary">
            <SummaryNotifications id={id} />
            <MachineSummary setSelectedAction={setSelectedAction} />
          </Route>
          <Route exact path="/machine/:id/network">
            <NetworkNotifications id={id} />
            <MachineNetwork />
          </Route>
          <Route exact path="/machine/:id/storage">
            <StorageNotifications id={id} />
            <MachineStorage />
          </Route>
          <Route exact path="/machine/:id/pci-devices">
            <MachinePCIDevices />
          </Route>
          <Route exact path="/machine/:id/usb-devices">
            <MachineUSBDevices />
          </Route>
          <Route exact path="/machine/:id/tests">
            <MachineTests />
          </Route>
          <Route exact path="/machine/:id">
            <Redirect to={`/machine/${id}/summary`} />
          </Route>
        </Switch>
      )}
    </Section>
  );
};

export default MachineDetails;
