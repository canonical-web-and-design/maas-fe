import type { Subnet } from "../store/subnet/types";

/**
 * Takes a subnet CIDR notation (IPv4) and returns the first and last IP of the subnet.
 * The network and host addresses are excluded.
 *
 * @param cidr The CIDR notation of the subnet
 * @returns The first and last valid IP addresses as two strings in a list.
 */
export const getIpRangeFromCidr = (cidr: Subnet["cidr"]) => {
  // https://gist.github.com/binarymax/6114792

  // Get start IP and number of valid addresses
  const startIp = cidr.split("/")[0];
  const numberOfAddresses = (1 << (32 - parseInt(cidr.split("/")[1]))) - 1;

  // Split start IP into octets
  const startIpOctetList = startIp.split(".").map((a) => parseInt(a));

  // IPv4 can be represented by an unsigned 32-bit integer, so we can use a Uint32Array to store the IP
  const buffer = new ArrayBuffer(4); //4 octets
  const int32 = new Uint32Array(buffer);

  // Convert starting IP to Uint32 and add the number of addresses to get the end IP.
  // Subtract 1 from the number of addresses to exclude the broadcast address.
  int32[0] =
    (startIpOctetList[0] << 24) +
    (startIpOctetList[1] << 16) +
    (startIpOctetList[2] << 8) +
    startIpOctetList[3] +
    numberOfAddresses -
    1;

  // Convert the buffer to a Uint8Array to get the octets, then convert it to an array
  const arrayApplyBuffer = Array.from(new Uint8Array(buffer));

  // Reverse the octets and join them with "." to get the end IP
  const endIp = arrayApplyBuffer.reverse().join(".");

  const firstValidIp = getFirstValidIp(startIp);

  return [firstValidIp, endIp];
};

const getFirstValidIp = (ip: string) => {
  const startIpOctetList = ip.split(".").map((a) => parseInt(a));

  const buffer = new ArrayBuffer(4); //4 octets
  const int32 = new Uint32Array(buffer);

  // add 1 because the first IP is the network address
  int32[0] =
    (startIpOctetList[0] << 24) +
    (startIpOctetList[1] << 16) +
    (startIpOctetList[2] << 8) +
    startIpOctetList[3] +
    1;

  const arrayApplyBuffer = Array.from(new Uint8Array(buffer));

  return arrayApplyBuffer.reverse().join(".");
};

const getIpAsUint32 = (ip: string) => {
  const octets = ip.split(".").map((a) => parseInt(a));
  const buffer = new ArrayBuffer(4);
  const int32 = new Uint32Array(buffer);
  int32[0] =
    (octets[0] << 24) + (octets[1] << 16) + (octets[2] << 8) + octets[3];
  return int32[0];
};

/**
 * Checks if an IPv4 address is valid for the given subnet.
 *
 * @param ip The IPv4 address to check, as a string
 * @param cidr The subnet's CIDR notation e.g. 192.168.0.0/24
 * @returns True if the IP is in the subnet, false otherwise
 */
export const isIpInSubnet = (ip: string, cidr: Subnet["cidr"]) => {
  const [startIP, endIP] = getIpRangeFromCidr(cidr);

  const ipUint32 = getIpAsUint32(ip);
  const startIPUint32 = getIpAsUint32(startIP);
  const endIPUint32 = getIpAsUint32(endIP);

  return ipUint32 >= startIPUint32 && ipUint32 <= endIPUint32;
};
