import type { VMClusterMeta } from "./enum";

import type { APIError } from "app/base/types";
import type { Machine } from "app/store/machine/types";
import type { Pod, PodPowerParameters } from "app/store/pod/types";
import type {
  ResourcePool,
  ResourcePoolMeta,
} from "app/store/resourcepool/types";
import type { Model } from "app/store/types/model";
import type { GenericState } from "app/store/types/state";
import type { Zone, ZoneMeta } from "app/store/zone/types";

export type VMClusterResource = {
  total: number;
  free: number;
};
export type VMClusterResourcesMemory = {
  hugepages: VMClusterResource;
  general: VMClusterResource;
};

export type VMClusterResources = {
  cpu: VMClusterResource;
  memory: VMClusterResourcesMemory;
  storage: VMClusterResource;
  storage_pools: Record<string, VMClusterResource>;
  vm_count: number;
};

export type VMHost = Model & {
  name: Pod["name"];
  project: PodPowerParameters["project"];
  tags: Pod["tags"];
  resource_pool: ResourcePool["name"];
  availability_zone: Zone["name"];
};

export type VirtualMachine = {
  hugepages_backed: boolean;
  name: string;
  pinned_cores: number[];
  project: string;
  system_id: Machine["system_id"];
  unpinned_cores: number;
};

export type VMCluster = Model & {
  name: string;
  project: string;
  hosts: VMHost[];
  total_resources: VMClusterResources;
  virtual_machines: VirtualMachine[];
  resource_pool: ResourcePool[ResourcePoolMeta.PK] | "";
  availability_zone: Zone[ZoneMeta.PK];
  version: string | "";
};

export type VMClusterEventError = {
  error: APIError;
  event: string;
};

export type VMClusterStatuses = {
  deleting: boolean;
  getting: boolean;
};

export type VMClusterState = {
  eventErrors: VMClusterEventError[];
  physicalClusters: VMCluster[VMClusterMeta.PK][][];
  statuses: VMClusterStatuses;
} & GenericState<VMCluster, APIError>;
