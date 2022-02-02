import type { Space } from "app/store/space/types";
import type { Subnet, SubnetDetails } from "app/store/subnet/types";
import type { VLAN } from "app/store/vlan/types";

/**
 * Get the Subnet display text.
 * @param subnet - A subnet.
 * @return The subnet display text.
 */
export const getSubnetDisplay = (
  subnet: Subnet | null | undefined,
  short?: boolean
): string => {
  if (!subnet) {
    return "Unconfigured";
  } else if (!short && subnet.cidr !== subnet.name) {
    return `${subnet.cidr} (${subnet.name})`;
  } else {
    return subnet.cidr;
  }
};

/**
 * Returns whether a subnet is of type SubnetDetails.
 * @param subnet - The subnet to check.
 * @returns Whether the subnet is of type SubnetDetails.
 */
export const isSubnetDetails = (
  subnet?: Subnet | null
): subnet is SubnetDetails => !!subnet && "ip_addresses" in subnet;

/**
 * Get the Subnet available IPs.
 * @param subnet - A subnet.
 * @return Subnet's available IPs string, e.g. "100%"
 */
export const getAvailableIPs = (subnet: Subnet | null | undefined): string => {
  if (!subnet) {
    return "Unconfigured";
  } else {
    return `${subnet?.statistics?.available_string}`;
  }
};

/**
 * Get Subnets for a given VLAN id
 * @param subnets - Subnets.
 * @param vlanId - VLAN id.
 * @return Subnets for a given VLAN id
 */
export const getSubnetsInVLAN = (
  subnets: Subnet[],
  vlanId: VLAN["id"]
): Subnet[] => subnets.filter((subnet) => subnet.vlan === vlanId);

/**
 * Get subnets in a given space
 * @param subnets - The subnets to check.
 * @param spaceId - Space id
 * @returns subnets in a given space.
 */
export const getSubnetsInSpace = (
  subnets: Subnet[],
  spaceId: Space["id"]
): Subnet[] => subnets.filter((subnet) => subnet.space === spaceId);

/**
 * Get VLAN on a given subnet
 * @param subnets - Subnets.
 * @param vlanId - VLAN id.
 * @return Subnets for a given VLAN id.
 */
export const getVLANOnSubnet = (
  vlans: VLAN[],
  subnet: Subnet
): VLAN | undefined => vlans.find((vlan) => vlan.id === subnet.vlan);

/**
 * Get if DHCP is enabled on a given subnet
 * @param subnet - All VLANS.
 * @param subnet - The subnet to check.
 */
export const getIsDHCPEnabled = (
  vlans?: VLAN[],
  subnet?: Subnet | null
): boolean => {
  if (!vlans || !subnet) {
    return false;
  }
  const vlanOnSubnet = getVLANOnSubnet(vlans, subnet);
  return vlanOnSubnet?.dhcp_on || false;
};

/**
 * Get if a subnet can be deleted.
 * @param subnet - The subnet to check.
 */
export const getCanBeDeleted = (vlans: VLAN[], subnet: Subnet): boolean => {
  const isDHCPEnabled = getIsDHCPEnabled(vlans, subnet);
  return !isDHCPEnabled || (isDHCPEnabled && !getHasIPAddresses(subnet));
};

export const getHasIPAddresses = (subnet?: Subnet): boolean =>
  isSubnetDetails(subnet) ? subnet?.ip_addresses.length === 0 : false;
