import { useEffect } from "react";

import { Button } from "@canonical/react-components";
import pluralize from "pluralize";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";

import AddHardware from "./AddHardwareMenu";

import SectionHeader from "app/base/components/SectionHeader";
import ActionFormWrapper from "app/machines/components/ActionFormWrapper";
import TakeActionMenu from "app/machines/components/TakeActionMenu";
import machineURLs from "app/machines/urls";
import type {
  MachineSelectedAction,
  MachineSetSelectedAction,
} from "app/machines/views/types";
import poolsURLs from "app/pools/urls";
import { actions as machineActions } from "app/store/machine";
import machineSelectors from "app/store/machine/selectors";
import type { Machine } from "app/store/machine/types";
import { actions as resourcePoolActions } from "app/store/resourcepool";
import resourcePoolSelectors from "app/store/resourcepool/selectors";

const getMachineCount = (
  machines: Machine[],
  selectedMachines: Machine[],
  setSearchFilter: (filter: string) => void
) => {
  const machineCountString = `${machines.length} ${pluralize(
    "machine",
    machines.length
  )}`;
  if (selectedMachines.length) {
    if (machines.length === selectedMachines.length) {
      return "All machines selected";
    }
    return (
      <Button
        className="p-button--link"
        onClick={() => setSearchFilter("in:(Selected)")}
      >
        {`${selectedMachines.length} of ${machineCountString} selected`}
      </Button>
    );
  }
  return `${machineCountString} available`;
};

type Props = {
  selectedAction?: MachineSelectedAction | null;
  setSearchFilter: (filter: string) => void;
  setSelectedAction: MachineSetSelectedAction;
};

export const MachineListHeader = ({
  selectedAction,
  setSearchFilter,
  setSelectedAction,
}: Props): JSX.Element => {
  const dispatch = useDispatch();
  const location = useLocation();
  const machines = useSelector(machineSelectors.all);
  const machinesLoaded = useSelector(machineSelectors.loaded);
  const resourcePools = useSelector(resourcePoolSelectors.all);
  const selectedMachines = useSelector(machineSelectors.selected);

  useEffect(() => {
    dispatch(machineActions.fetch());
    dispatch(resourcePoolActions.fetch());
  }, [dispatch]);

  useEffect(() => {
    if (location.pathname !== machineURLs.machines.index) {
      setSelectedAction(null);
    }
  }, [location.pathname, setSelectedAction]);

  const getHeaderButtons = () => {
    if (location.pathname === machineURLs.machines.index) {
      return [
        <AddHardware
          disabled={selectedMachines.length > 0}
          key="add-hardware"
        />,
        <TakeActionMenu
          key="machine-list-action-menu"
          setSelectedAction={setSelectedAction}
        />,
      ];
    }
    if (location.pathname === poolsURLs.pools) {
      return [
        <Button data-test="add-pool" element={Link} to={poolsURLs.add}>
          Add pool
        </Button>,
      ];
    }
    return null;
  };

  return (
    <SectionHeader
      buttons={getHeaderButtons()}
      formWrapper={
        selectedAction && (
          <ActionFormWrapper
            selectedAction={selectedAction}
            setSelectedAction={setSelectedAction}
          />
        )
      }
      loading={!machinesLoaded}
      subtitle={getMachineCount(machines, selectedMachines, setSearchFilter)}
      tabLinks={[
        {
          active: location.pathname.startsWith(machineURLs.machines.index),
          component: Link,
          label: `${pluralize("Machine", machines.length, true)}`,
          to: machineURLs.machines.index,
        },
        {
          active: location.pathname.startsWith(poolsURLs.pools),
          component: Link,
          label: `${pluralize("Resource pool", resourcePools.length, true)}`,
          to: poolsURLs.pools,
        },
      ]}
      title="Machines"
    />
  );
};

MachineListHeader.propTypes = {
  searchFilter: PropTypes.string,
  selectedAction: PropTypes.object,
  setSearchFilter: PropTypes.func.isRequired,
  setSelectedAction: PropTypes.func.isRequired,
};

export default MachineListHeader;
