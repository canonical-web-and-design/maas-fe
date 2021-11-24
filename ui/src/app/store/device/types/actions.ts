import type { Device, DeviceDetails, DeviceNetworkInterface } from "./base";
import type { DeviceIpAssignment, DeviceMeta } from "./enum";

import type { Controller, ControllerMeta } from "app/store/controller/types";
import type { Domain } from "app/store/domain/types";
import type { Machine, MachineMeta } from "app/store/machine/types";
import type { Subnet, SubnetMeta } from "app/store/subnet/types";
import type { NetworkInterface } from "app/store/types/node";
import type { Zone } from "app/store/zone/types";

export type CreateParams = {
  description?: DeviceDetails["description"];
  domain?: {
    name: Domain["name"];
  };
  extra_macs?: Device["extra_macs"];
  hostname?: Device["hostname"];
  interfaces: {
    ip_address?: DeviceNetworkInterface["ip_address"];
    ip_assignment: DeviceIpAssignment;
    mac: DeviceNetworkInterface["mac_address"];
    name?: DeviceNetworkInterface["name"];
    subnet?: Subnet[SubnetMeta.PK] | null;
  }[];
  parent?: Controller[ControllerMeta.PK] | Machine[MachineMeta.PK];
  primary_mac: Device["primary_mac"];
  swap_size?: DeviceDetails["swap_size"];
  zone?: {
    name: Zone["name"];
  };
};

export type CreateInterfaceParams = {
  [DeviceMeta.PK]: Device[DeviceMeta.PK];
  enabled?: NetworkInterface["enabled"];
  interface_speed?: NetworkInterface["interface_speed"];
  ip_address?: Device["ip_address"];
  ip_assignment: Device["ip_assignment"];
  link_connected?: NetworkInterface["link_connected"];
  link_speed?: NetworkInterface["link_speed"];
  mac_address: NetworkInterface["mac_address"];
  name?: NetworkInterface["name"];
  numa_node?: NetworkInterface["numa_node"];
  subnet?: Subnet[SubnetMeta.PK];
  tags?: NetworkInterface["tags"];
  vlan?: NetworkInterface["vlan_id"];
};

export type UpdateParams = Partial<CreateParams> & {
  [DeviceMeta.PK]: Device[DeviceMeta.PK];
  tags?: string;
};
