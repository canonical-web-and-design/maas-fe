import { actions } from "./slice";
import { DeviceIpAssignment } from "./types";

describe("device actions", () => {
  it("should handle fetching devices", () => {
    expect(actions.fetch()).toEqual({
      type: "device/fetch",
      meta: {
        model: "device",
        method: "list",
      },
      payload: null,
    });
  });

  it("should handle creating devices", () => {
    expect(
      actions.create({
        interfaces: [
          {
            mac: "aa:bb:cc",
            ip_assignment: DeviceIpAssignment.EXTERNAL,
            ip_address: "1.2.3.4",
            subnet: 9,
          },
        ],
      })
    ).toEqual({
      type: "device/create",
      meta: {
        model: "device",
        method: "create",
      },
      payload: {
        params: {
          interfaces: [
            {
              mac: "aa:bb:cc",
              ip_assignment: DeviceIpAssignment.EXTERNAL,
              ip_address: "1.2.3.4",
              subnet: 9,
            },
          ],
        },
      },
    });
  });

  it("should handle creating an interface", () => {
    expect(
      actions.createInterface({
        enabled: false,
        ip_assignment: DeviceIpAssignment.EXTERNAL,
        mac_address: "aa:bb:cc",
        name: "abc",
        numa_node: 9,
        system_id: "abc123",
      })
    ).toEqual({
      type: "device/createInterface",
      meta: {
        model: "device",
        method: "create_interface",
      },
      payload: {
        params: {
          enabled: false,
          ip_assignment: DeviceIpAssignment.EXTERNAL,
          mac_address: "aa:bb:cc",
          name: "abc",
          numa_node: 9,
          system_id: "abc123",
        },
      },
    });
  });

  it("should handle updating devices", () => {
    expect(
      actions.update({
        system_id: "abc123",
        interfaces: [
          {
            mac: "aa:bb:cc",
            ip_assignment: DeviceIpAssignment.EXTERNAL,
            ip_address: "1.2.3.4",
            subnet: 9,
          },
        ],
      })
    ).toEqual({
      type: "device/update",
      meta: {
        model: "device",
        method: "update",
      },
      payload: {
        params: {
          system_id: "abc123",
          interfaces: [
            {
              mac: "aa:bb:cc",
              ip_assignment: DeviceIpAssignment.EXTERNAL,
              ip_address: "1.2.3.4",
              subnet: 9,
            },
          ],
        },
      },
    });
  });
});
