import type { TSFixMe } from "app/base/types";
import type { Model } from "app/store/types/model";
import type { GenericState } from "app/store/types/state";

export type Space = Model & {
  created: string;
  description: string;
  name: string;
  subnet_ids: number[];
  updated: string;
  vlan_ids: number[];
};

export type SpaceState = GenericState<Space, TSFixMe>;
