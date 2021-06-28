import { createSelector } from "@reduxjs/toolkit";

import type { PodDetails } from "app/store/pod/types";
import type { RootState } from "app/store/root/types";
import { SubnetMeta } from "app/store/subnet/types";
import type { Subnet, SubnetState } from "app/store/subnet/types";
import { generateBaseSelectors } from "app/store/utils";

const searchFunction = (subnet: Subnet, term: string) =>
  subnet.name.includes(term);

const defaultSelectors = generateBaseSelectors<
  SubnetState,
  Subnet,
  SubnetMeta.PK
>(SubnetMeta.MODEL, SubnetMeta.PK, searchFunction);

/**
 * Get subnets for a given cidr.
 * @param state - The redux state.
 * @param cidr - The cidr to filter by.
 * @returns Subnets for a cidr.
 */
const getByCIDR = createSelector(
  [
    defaultSelectors.all,
    (_state: RootState, cidr: Subnet["cidr"] | null) => cidr,
  ],
  (subnets, cidr) => {
    if (!cidr) {
      return null;
    }
    return subnets.find((subnet) => subnet.cidr === cidr);
  }
);

/**
 * Get subnets that are available to a given pod.
 * @param {RootState} state - The redux state.
 * @param {Pod} pod - The pod to query.
 * @returns {Subnet[]} Subnets that are available to a given pod.
 */
const getByPod = createSelector(
  [defaultSelectors.all, (_state: RootState, pod: PodDetails) => pod],
  (subnets, pod) => {
    if (!pod) {
      return [];
    }
    return subnets.filter((subnet) =>
      pod.attached_vlans?.includes(subnet.vlan)
    );
  }
);

/**
 * Get PXE-enabled subnets that are available to a given pod.
 * @param {RootState} state - The redux state.
 * @param {Pod} pod - The pod to query.
 * @returns {Subnet[]} PXE-enabled subnets that are available to a given pod.
 */
const getPxeEnabledByPod = createSelector(
  [defaultSelectors.all, (_state: RootState, pod: PodDetails) => pod],
  (subnets, pod) => {
    if (!pod) {
      return [];
    }
    return subnets.filter((subnet) => pod.boot_vlans?.includes(subnet.vlan));
  }
);

const selectors = {
  ...defaultSelectors,
  getByCIDR,
  getByPod,
  getPxeEnabledByPod,
};

export default selectors;
