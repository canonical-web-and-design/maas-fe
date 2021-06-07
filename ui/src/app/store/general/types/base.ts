import type {
  BondLacpRate,
  BondMode,
  BondXmitHashPolicy,
  DriverType,
  PowerFieldScope,
  PowerFieldType,
} from "./enum";

import type { TSFixMe } from "app/base/types";
import type { MachineActions } from "app/store/machine/types";

export type Architecture = string;

export type ArchitecturesState = {
  errors: TSFixMe;
  data: Architecture[];
  loaded: boolean;
  loading: boolean;
};

export type BondModeOptions = [
  [BondMode.BALANCE_RR, BondMode.BALANCE_RR],
  [BondMode.ACTIVE_BACKUP, BondMode.ACTIVE_BACKUP],
  [BondMode.BALANCE_XOR, BondMode.BALANCE_XOR],
  [BondMode.BROADCAST, BondMode.BROADCAST],
  [BondMode.LINK_AGGREGATION, BondMode.LINK_AGGREGATION],
  [BondMode.BALANCE_TLB, BondMode.BALANCE_TLB],
  [BondMode.BALANCE_ALB, BondMode.BALANCE_ALB]
];

export type BondLacpRateOptions = [
  [BondLacpRate.FAST, BondLacpRate.FAST],
  [BondLacpRate.SLOW, BondLacpRate.SLOW]
];

export type BondXmitHashPolicyOptions = [
  [BondXmitHashPolicy.LAYER2, BondXmitHashPolicy.LAYER2],
  [BondXmitHashPolicy.LAYER2_3, BondXmitHashPolicy.LAYER2_3],
  [BondXmitHashPolicy.LAYER3_4, BondXmitHashPolicy.LAYER3_4],
  [BondXmitHashPolicy.ENCAP2_3, BondXmitHashPolicy.ENCAP2_3],
  [BondXmitHashPolicy.ENCAP3_4, BondXmitHashPolicy.ENCAP3_4]
];

export type BondOptions = {
  lacp_rates: BondLacpRateOptions;
  modes: BondModeOptions;
  xmit_hash_policies: BondXmitHashPolicyOptions;
};

export type BondOptionsState = {
  errors: TSFixMe;
  data: BondOptions;
  loaded: boolean;
  loading: boolean;
};

export type ComponentToDisable = "restricted" | "universe" | "multiverse";

export type ComponentsToDisableState = {
  errors: TSFixMe;
  data: ComponentToDisable[];
  loaded: boolean;
  loading: boolean;
};

export type DefaultMinHweKernel = string;

export type DefaultMinHweKernelState = {
  errors: TSFixMe;
  data: DefaultMinHweKernel;
  loaded: boolean;
  loading: boolean;
};

export type HWEKernel = [string, string];

export type HWEKernelsState = {
  errors: TSFixMe;
  data: HWEKernel[];
  loaded: boolean;
  loading: boolean;
};

export type KnownArchitecture =
  | "amd64"
  | "i386"
  | "armhf"
  | "arm64"
  | "ppc64el"
  | "s390x";

export type KnownArchitecturesState = {
  errors: TSFixMe;
  data: KnownArchitecture[];
  loaded: boolean;
  loading: boolean;
};

export type MachineAction = {
  name: MachineActions;
  sentence: string;
  title: string;
  type: string;
};

export type MachineActionsState = {
  errors: TSFixMe;
  data: MachineAction[];
  loaded: boolean;
  loading: boolean;
};

export type OSInfoOsKernelEntry = [string, string];

export type OSInfoOS = {
  [x: string]: [string, string][];
};

export type OSInfoKernels = {
  [x: string]: OSInfoOS;
};

export type OSInfoOSystem = [string, string];

export type OSInfoRelease = [string, string];

export type OSInfo = {
  osystems: OSInfoOSystem[];
  releases: OSInfoRelease[];
  kernels: OSInfoKernels;
  default_osystem: string;
  default_release: string;
};

export type OSInfoState = {
  errors: TSFixMe;
  data: OSInfo | null;
  loaded: boolean;
  loading: boolean;
};

export type PocketToDisable = "updates" | "security" | "backports";

export type PocketsToDisableState = {
  errors: TSFixMe;
  data: PocketToDisable[];
  loaded: boolean;
  loading: boolean;
};

export type Choice = [string, string];

export type PowerField = {
  choices: Choice[];
  default: number | string;
  field_type: PowerFieldType;
  label: string;
  name: string;
  required: boolean;
  scope: PowerFieldScope;
};

export type PowerType = {
  can_probe: boolean;
  chassis: boolean;
  defaults?: {
    cores: number;
    memory: number;
    storage: number;
  };
  description: string;
  driver_type: DriverType;
  fields: PowerField[];
  missing_packages: string[];
  name: string;
  queryable: boolean;
};

export type PowerTypesState = {
  errors: TSFixMe;
  data: PowerType[];
  loaded: boolean;
  loading: boolean;
};

export type Version = string;

export type VersionState = {
  errors: TSFixMe;
  data: Version;
  loaded: boolean;
  loading: boolean;
};

export type GeneralState = {
  architectures: ArchitecturesState;
  bondOptions: BondOptionsState;
  componentsToDisable: ComponentsToDisableState;
  defaultMinHweKernel: DefaultMinHweKernelState;
  hweKernels: HWEKernelsState;
  knownArchitectures: KnownArchitecturesState;
  machineActions: MachineActionsState;
  osInfo: OSInfoState;
  pocketsToDisable: PocketsToDisableState;
  powerTypes: PowerTypesState;
  version: VersionState;
};
