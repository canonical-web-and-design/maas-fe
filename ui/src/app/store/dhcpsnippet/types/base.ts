import type { APIError } from "app/base/types";
import type { Device } from "app/store/device/types";
import type { Subnet } from "app/store/subnet/types";
import type { Host } from "app/store/types/host";
import type { TimestampedModel } from "app/store/types/model";
import type { GenericState } from "app/store/types/state";

export type DHCPSnippetHistory = Omit<TimestampedModel, "updated"> & {
  value: string;
};

export type DHCPSnippet = TimestampedModel & {
  description: string;
  enabled: boolean;
  history: DHCPSnippetHistory[];
  name: string;
  node: Host["system_id"] | Device["system_id"] | null;
  subnet: Subnet["id"] | null;
  value: string;
};

export type DHCPSnippetState = GenericState<DHCPSnippet, APIError>;
