import { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";

import { actions as controllerActions } from "app/store/controller";
import controllerSelectors from "app/store/controller/selectors";
import type { Controller } from "app/store/controller/types";
import { actions as deviceActions } from "app/store/device";
import deviceSelectors from "app/store/device/selectors";
import type { Device } from "app/store/device/types";
import type { DHCPSnippet } from "app/store/dhcpsnippet/types";
import { actions as machineActions } from "app/store/machine";
import machineSelectors from "app/store/machine/selectors";
import type { Machine } from "app/store/machine/types";
import type { RootState } from "app/store/root/types";
import { actions as subnetActions } from "app/store/subnet";
import subnetSelectors from "app/store/subnet/selectors";
import type { Subnet } from "app/store/subnet/types";

export const useDhcpTarget = (
  nodeId?: DHCPSnippet["node"],
  subnetId?: DHCPSnippet["subnet"]
): {
  loading: boolean;
  loaded: boolean;
  target: Subnet | Machine | Device | Controller | null;
  type: "subnet" | "controller" | "device" | "machine" | null;
} => {
  const dispatch = useDispatch();

  const subnetLoading = useSelector(subnetSelectors.loading);
  const subnetLoaded = useSelector(subnetSelectors.loaded);
  const subnet = useSelector((state: RootState) =>
    subnetSelectors.getById(state, subnetId)
  );
  const controllerLoading = useSelector(controllerSelectors.loading);
  const controllerLoaded = useSelector(controllerSelectors.loaded);
  const controller = useSelector((state: RootState) =>
    controllerSelectors.getById(state, nodeId)
  );
  const deviceLoading = useSelector(deviceSelectors.loading);
  const deviceLoaded = useSelector(deviceSelectors.loaded);
  const device = useSelector((state: RootState) =>
    deviceSelectors.getById(state, nodeId)
  );
  const machineLoading = useSelector(machineSelectors.loading);
  const machineLoaded = useSelector(machineSelectors.loaded);
  const machine = useSelector((state: RootState) =>
    machineSelectors.getById(state, nodeId)
  );
  const isLoading =
    (!!subnetId && subnetLoading) ||
    (!!nodeId && (controllerLoading || deviceLoading || machineLoading));
  const hasLoaded =
    (!!subnetId && subnetLoaded) ||
    (!!nodeId && controllerLoaded && deviceLoaded && machineLoaded);

  useEffect(() => {
    dispatch(subnetActions.fetch());
    dispatch(controllerActions.fetch());
    dispatch(deviceActions.fetch());
    dispatch(machineActions.fetch());
  }, [dispatch]);

  return {
    loading: isLoading,
    loaded: hasLoaded,
    target: subnet || machine || device || controller,
    type:
      (subnet && "subnet") ||
      (controller && "controller") ||
      (device && "device") ||
      (machine && "machine") ||
      null,
  };
};
