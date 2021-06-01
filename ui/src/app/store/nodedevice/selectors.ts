import { createSelector } from "@reduxjs/toolkit";

import type { Machine } from "../machine/types";

import { NodeDeviceMeta } from "./types";
import type { NodeDevice, NodeDeviceState } from "./types";

import type { RootState } from "app/store/root/types";
import { generateBaseSelectors } from "app/store/utils";

const defaultSelectors = generateBaseSelectors<
  NodeDeviceState,
  NodeDevice,
  NodeDeviceMeta.PK
>(NodeDeviceMeta.MODEL, NodeDeviceMeta.PK);

/**
 * Returns node devices by machine id
 * @param state - Redux state
 * @returns node devices associated with a given machine.
 */
const getByMachineId = createSelector(
  [
    defaultSelectors.all,
    (_: RootState, machineId: Machine["id"] | null) => machineId,
  ],
  (nodeDevices, machineId): NodeDevice[] =>
    nodeDevices.filter((nodeDevice) => nodeDevice.node_id === machineId)
);

const nodeDevice = {
  ...defaultSelectors,
  getByMachineId,
};

export default nodeDevice;
