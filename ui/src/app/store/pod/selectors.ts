import { createSelector } from "@reduxjs/toolkit";

import controller from "app/store/controller/selectors";
import type { Controller } from "app/store/controller/types";
import machine from "app/store/machine/selectors";
import type { Machine } from "app/store/machine/types";
import { FilterMachines } from "app/store/machine/utils";
import type { LxdServerGroup, Pod, PodState } from "app/store/pod/types";
import { PodMeta, PodType } from "app/store/pod/types";
import type { RootState } from "app/store/root/types";
import type { Host } from "app/store/types/host";
import { generateBaseSelectors } from "app/store/utils";

const searchFunction = (pod: Pod, term: string) => pod.name.includes(term);

const defaultSelectors = generateBaseSelectors<PodState, Pod, PodMeta.PK>(
  PodMeta.MODEL,
  PodMeta.PK,
  searchFunction
);

/**
 * Returns all KVMs that MAAS supports.
 * @param {RootState} state - The redux state.
 * @returns {Pod[]} A list of all KVMs.
 */
const kvms = (state: RootState): Pod[] =>
  state.pod.items.filter((pod) =>
    [PodType.LXD, PodType.VIRSH].includes(pod.type)
  );

/**
 * Returns all LXD pods.
 * @param state - The redux state.
 * @returns A list of all LXD pods.
 */
const lxd = (state: RootState): Pod[] =>
  state.pod.items.filter((pod) => pod.type === PodType.LXD);

/**
 * Returns all virsh pods.
 * @param state - The redux state.
 * @returns A list of all virsh pods.
 */
const virsh = (state: RootState): Pod[] =>
  state.pod.items.filter((pod) => pod.type === PodType.VIRSH);

/**
 * Returns active pod id.
 * @param state - The redux state.
 * @returns Active pod id.
 */
const activeID = (state: RootState): number | null => state.pod.active;

/**
 * Returns pod statuses.
 * @param state - The redux state.
 * @returns Pod statuses.
 */
const statuses = (state: RootState): PodState["statuses"] => state.pod.statuses;

/**
 * Returns pod projects keyed by power address.
 * @param state - The redux state.
 * @returns Pod projects.
 */
const projects = (state: RootState): PodState["projects"] => state.pod.projects;

/**
 * Returns active pod.
 * @param state - The redux state.
 * @returns Active pod.
 */
const active = createSelector(
  [defaultSelectors.all, activeID],
  (pods, activeID) => pods.find((pod) => pod.id === activeID)
);

/**
 * Returns all machines/controllers that host a pod.
 * @param state - The redux state.
 * @returns All pod host machines/controllers.
 */
const getAllHosts = createSelector(
  [defaultSelectors.all, machine.all, controller.all],
  (pods: Pod[], machines: Machine[], controllers: Controller[]) => {
    return pods.reduce<Host[]>((hosts, pod) => {
      if (pod.host) {
        const hostMachine = machines.find(
          (machine) => machine.system_id === pod.host
        );
        if (hostMachine) {
          return [...hosts, hostMachine];
        } else {
          const hostController = controllers.find(
            (controller) => controller.system_id === pod.host
          );
          if (hostController) {
            return [...hosts, hostController];
          }
        }
      }
      return hosts;
    }, []);
  }
);

/**
 * Returns the pod host, which can be either a machine or controller.
 * @param state - The redux state.
 * @returns Pod host machine/controller.
 */
const getHost = createSelector(
  [machine.all, controller.all, (_: RootState, pod: Pod) => pod],
  (machines: Machine[], controllers: Controller[], pod: Pod): Host | null => {
    if (!pod?.host) {
      return null;
    }
    const hostMachine = machines.find(
      (machine) => machine.system_id === pod.host
    );
    const hostController = controllers.find(
      (controller) => controller.system_id === pod.host
    );
    return hostMachine || hostController || null;
  }
);

/**
 * Returns a pod's virtual machines.
 * @param state - The redux state.
 * @param pod - The pod whose virtual machines are to be returned.
 * @returns The pod's virtual machines.
 */
const getVMs = createSelector(
  [machine.all, (_: RootState, podId: Pod[PodMeta.PK] | null) => podId],
  (machines: Machine[], podId: Pod[PodMeta.PK] | null): Machine[] =>
    machines.filter((machine) => machine.pod?.id === podId)
);

/**
 * Filter pod VMs to those that match terms.
 * @param {RootState} state - The redux state.
 * @param {String} terms - The terms to match against.
 * @returns A filtered list of VMs.
 */
const filteredVMs = createSelector(
  [
    (state: RootState, podId: Pod[PodMeta.PK], terms: string) => ({
      terms,
      selectedIDs: machine.selectedIDs(state),
      vms: getVMs(state, podId),
    }),
  ],
  ({ terms, selectedIDs, vms }) => {
    if (!terms) {
      return vms;
    }
    return FilterMachines.filterItems(vms, terms, selectedIDs);
  }
);

/**
 * Returns the pods which are being deleted.
 * @param state - The redux state.
 * @returns Pods being deleted.
 */
const deleting = createSelector(
  [defaultSelectors.all, statuses],
  (pods, statuses) => pods.filter((pod) => statuses[pod.id].deleting)
);

/**
 * Returns the pods which are composing machines.
 * @param state - The redux state.
 * @returns Pods composing machines.
 */
const composing = createSelector(
  [defaultSelectors.all, statuses],
  (pods, statuses) => pods.filter((pod) => statuses[pod.id].composing)
);

/**
 * Returns the pods which are being refreshed.
 * @param state - The redux state.
 * @returns Pods being refreshed.
 */
const refreshing = createSelector(
  [defaultSelectors.all, statuses],
  (pods, statuses) => pods.filter((pod) => statuses[pod.id].refreshing)
);

/**
 * Returns LXD pods grouped by LXD server address.
 * @param state - The redux state.
 * @returns Active pod.
 */
const groupByLxdServer = createSelector([lxd], (lxdPods) =>
  lxdPods.reduce<LxdServerGroup[]>((groups, lxdPod) => {
    const group = groups.find(
      (group) => group.address === lxdPod.power_address
    );
    if (group) {
      group.pods.push(lxdPod);
    } else {
      const newGroup = {
        address: lxdPod.power_address,
        pods: [lxdPod],
      };
      groups.push(newGroup);
    }
    return groups;
  }, [])
);

/**
 * Returns pods in a given LXD server.
 * @param state - The redux state.
 * @param address - The address of the LXD server.
 * @returns A list of LXD pods in the server.
 */
const getByLxdServer = createSelector(
  [
    groupByLxdServer,
    (_: RootState, address: LxdServerGroup["address"] | null) => address,
  ],
  (groups, address) => {
    const group = groups.find((group) => group.address === address);
    return group?.pods || [];
  }
);

/**
 * Returns projects in a given LXD server.
 * @param state - The redux state.
 * @param address - The address of the LXD server.
 * @returns A list of LXD projects in the server.
 */
const getProjectsByLxdServer = createSelector(
  [projects, (_: RootState, address: LxdServerGroup["address"]) => address],
  (projects, address) => projects[address] || []
);

/**
 * Returns a VM's resource details, given its system_id.
 * @param state - The redux state.
 * @param podId - The id of the pod.
 * @param machineId - The system_id of the machine in the pod.
 * @returns The VM's resource details.
 */
const getVmResource = createSelector(
  [
    (
      state: RootState,
      podId: Pod[PodMeta.PK],
      machineId: Machine["system_id"]
    ) => ({
      pod: defaultSelectors.getById(state, podId),
      machineId,
    }),
  ],
  ({ machineId, pod }) => {
    if (!pod || !machineId) {
      return null;
    }
    return pod.resources.vms.find((vm) => vm.system_id === machineId) || null;
  }
);

/**
 * Returns a pod's storage pools, sorted by default first then id.
 * @param state - The redux state.
 * @param podId - The id of the pod.
 * @returns A list of the pod's storage pools, sorted by default first then id.
 */
const getSortedPools = createSelector(
  [
    (state: RootState, podId: Pod[PodMeta.PK]) =>
      defaultSelectors.getById(state, podId),
  ],
  (pod) => {
    if (!pod) {
      return [];
    }
    const pools = pod.storage_pools || [];
    return [...pools].sort((a, b) => {
      if (a.id === pod.default_storage_pool || b.id > a.id) {
        return -1;
      }
      if (b.id === pod.default_storage_pool || a.id > b.id) {
        return 1;
      }
      return 0;
    });
  }
);

const selectors = {
  ...defaultSelectors,
  active,
  activeID,
  composing,
  deleting,
  filteredVMs,
  getAllHosts,
  getHost,
  getSortedPools,
  getVMs,
  getByLxdServer,
  getProjectsByLxdServer,
  getVmResource,
  groupByLxdServer,
  kvms,
  lxd,
  projects,
  refreshing,
  statuses,
  virsh,
};

export default selectors;
