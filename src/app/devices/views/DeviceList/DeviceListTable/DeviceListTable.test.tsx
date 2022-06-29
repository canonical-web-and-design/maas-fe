import type { ReactWrapper } from "enzyme";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import DeviceListTable from "./DeviceListTable";

import urls from "app/base/urls";
import type { Device } from "app/store/device/types";
import { DeviceIpAssignment } from "app/store/device/types";
import type { RootState } from "app/store/root/types";
import {
  device as deviceFactory,
  deviceState as deviceStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("DeviceListTable", () => {
  let device: Device;
  let state: RootState;

  beforeEach(() => {
    device = deviceFactory({
      domain: { id: 1, name: "domain" },
      fqdn: "device.domain",
      hostname: "device",
      ip_address: "192.168.1.1",
      ip_assignment: DeviceIpAssignment.STATIC,
      owner: "owner",
      primary_mac: "11:22:33:44:55:66",
      system_id: "abc123",
      tags: [1, 2],
      zone: { id: 2, name: "zone" },
    });
    state = rootStateFactory({
      device: deviceStateFactory({ items: [device] }),
    });
  });

  it("links to a device's details page", () => {
    device.system_id = "def456";
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <DeviceListTable
              devices={[device]}
              onSelectedChange={jest.fn()}
              selectedIDs={[]}
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find("Link[data-testid='device-details-link']").at(0).prop("to")
    ).toBe(urls.devices.device.index({ id: device.system_id }));
  });

  it("can show when a device has more than one mac address", () => {
    device.primary_mac = "11:11:11:11:11:11";
    device.extra_macs = ["22:22:22:22:22:22", "33:33:33:33:33:33"];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <DeviceListTable
              devices={[device]}
              onSelectedChange={jest.fn()}
              selectedIDs={[]}
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-testid='mac-display']").at(0).text()).toBe(
      "11:11:11:11:11:11 (+2)"
    );
  });

  it("links to a device's zone's details page", () => {
    device.zone = { id: 101, name: "danger" };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <DeviceListTable
              devices={[device]}
              onSelectedChange={jest.fn()}
              selectedIDs={[]}
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find("Link[data-testid='device-zone-link']").at(0).prop("to")
    ).toBe(urls.zones.details({ id: device.zone.id }));
  });

  describe("device list sorting", () => {
    const getRowTestId = (wrapper: ReactWrapper, index: number) =>
      wrapper.find("tbody tr").at(index).prop("data-testid");

    it("can sort by FQDN", () => {
      const devices = [
        deviceFactory({ fqdn: "b", system_id: "b" }),
        deviceFactory({ fqdn: "c", system_id: "c" }),
        deviceFactory({ fqdn: "a", system_id: "a" }),
      ];
      const store = mockStore(state);
      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter>
            <CompatRouter>
              <DeviceListTable
                devices={devices}
                onSelectedChange={jest.fn()}
                selectedIDs={[]}
              />
            </CompatRouter>
          </MemoryRouter>
        </Provider>
      );

      // Table is sorted be descending FQDN by default
      expect(getRowTestId(wrapper, 0)).toBe("device-a");
      expect(getRowTestId(wrapper, 1)).toBe("device-b");
      expect(getRowTestId(wrapper, 2)).toBe("device-c");

      // Change sort to ascending FQDN
      wrapper.find("[data-testid='fqdn-header']").simulate("click");
      expect(getRowTestId(wrapper, 0)).toBe("device-c");
      expect(getRowTestId(wrapper, 1)).toBe("device-b");
      expect(getRowTestId(wrapper, 2)).toBe("device-a");
    });

    it("can sort by IP assignment", () => {
      const devices = [
        deviceFactory({
          ip_assignment: DeviceIpAssignment.EXTERNAL,
          system_id: "b",
        }),
        deviceFactory({
          ip_assignment: DeviceIpAssignment.DYNAMIC,
          system_id: "a",
        }),
        deviceFactory({
          ip_assignment: "",
          system_id: "c",
        }),
      ];
      const store = mockStore(state);
      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter>
            <CompatRouter>
              <DeviceListTable
                devices={devices}
                onSelectedChange={jest.fn()}
                selectedIDs={[]}
              />
            </CompatRouter>
          </MemoryRouter>
        </Provider>
      );

      // Change sort to descending IP assignment
      wrapper.find("[data-testid='ip-header']").simulate("click");
      expect(getRowTestId(wrapper, 0)).toBe("device-a");
      expect(getRowTestId(wrapper, 1)).toBe("device-b");
      expect(getRowTestId(wrapper, 2)).toBe("device-c");

      // Change sort to ascending IP assignment
      wrapper.find("[data-testid='ip-header']").simulate("click");
      expect(getRowTestId(wrapper, 0)).toBe("device-c");
      expect(getRowTestId(wrapper, 1)).toBe("device-b");
      expect(getRowTestId(wrapper, 2)).toBe("device-a");
    });

    it("can sort by zone", () => {
      const devices = [
        deviceFactory({ system_id: "c", zone: { id: 1, name: "twilight" } }),
        deviceFactory({ system_id: "a", zone: { id: 2, name: "danger" } }),
        deviceFactory({ system_id: "b", zone: { id: 3, name: "forbidden" } }),
      ];
      const store = mockStore(state);
      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter>
            <CompatRouter>
              <DeviceListTable
                devices={devices}
                onSelectedChange={jest.fn()}
                selectedIDs={[]}
              />
            </CompatRouter>
          </MemoryRouter>
        </Provider>
      );

      // Change sort to descending zone name
      wrapper.find("[data-testid='zone-header']").simulate("click");
      expect(getRowTestId(wrapper, 0)).toBe("device-a");
      expect(getRowTestId(wrapper, 1)).toBe("device-b");
      expect(getRowTestId(wrapper, 2)).toBe("device-c");

      // Change sort to ascending zone name
      wrapper.find("[data-testid='zone-header']").simulate("click");
      expect(getRowTestId(wrapper, 0)).toBe("device-c");
      expect(getRowTestId(wrapper, 1)).toBe("device-b");
      expect(getRowTestId(wrapper, 2)).toBe("device-a");
    });

    it("can sort by owner", () => {
      const devices = [
        deviceFactory({ owner: "user", system_id: "c" }),
        deviceFactory({ owner: "admin", system_id: "a" }),
        deviceFactory({ owner: "bob", system_id: "b" }),
      ];
      const store = mockStore(state);
      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter>
            <CompatRouter>
              <DeviceListTable
                devices={devices}
                onSelectedChange={jest.fn()}
                selectedIDs={[]}
              />
            </CompatRouter>
          </MemoryRouter>
        </Provider>
      );

      // Change sort to descending owner
      wrapper.find("[data-testid='owner-header']").simulate("click");
      expect(getRowTestId(wrapper, 0)).toBe("device-a");
      expect(getRowTestId(wrapper, 1)).toBe("device-b");
      expect(getRowTestId(wrapper, 2)).toBe("device-c");

      // Change sort to ascending owner
      wrapper.find("[data-testid='owner-header']").simulate("click");
      expect(getRowTestId(wrapper, 0)).toBe("device-c");
      expect(getRowTestId(wrapper, 1)).toBe("device-b");
      expect(getRowTestId(wrapper, 2)).toBe("device-a");
    });
  });

  describe("device selection", () => {
    it("handles selecting a single device", () => {
      const devices = [deviceFactory({ system_id: "abc123" })];
      const onSelectedChange = jest.fn();
      const store = mockStore(state);
      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter>
            <CompatRouter>
              <DeviceListTable
                devices={devices}
                onSelectedChange={onSelectedChange}
                selectedIDs={[]}
              />
            </CompatRouter>
          </MemoryRouter>
        </Provider>
      );

      wrapper
        .find("[data-testid='device-checkbox'] input")
        .at(0)
        .simulate("change");

      expect(onSelectedChange).toHaveBeenCalledWith(["abc123"]);
    });

    it("handles unselecting a single device", () => {
      const devices = [deviceFactory({ system_id: "abc123" })];
      const onSelectedChange = jest.fn();
      const store = mockStore(state);
      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter>
            <CompatRouter>
              <DeviceListTable
                devices={devices}
                onSelectedChange={onSelectedChange}
                selectedIDs={["abc123"]}
              />
            </CompatRouter>
          </MemoryRouter>
        </Provider>
      );

      wrapper
        .find("[data-testid='device-checkbox'] input")
        .at(0)
        .simulate("change");

      expect(onSelectedChange).toHaveBeenCalledWith([]);
    });

    it("handles selecting all devices", () => {
      const devices = [
        deviceFactory({ system_id: "abc123" }),
        deviceFactory({ system_id: "def456" }),
      ];
      const onSelectedChange = jest.fn();
      const store = mockStore(state);
      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter>
            <CompatRouter>
              <DeviceListTable
                devices={devices}
                onSelectedChange={onSelectedChange}
                selectedIDs={[]}
              />
            </CompatRouter>
          </MemoryRouter>
        </Provider>
      );

      wrapper
        .find("[data-testid='all-devices-checkbox'] input")
        .simulate("change");

      expect(onSelectedChange).toHaveBeenCalledWith(["abc123", "def456"]);
    });

    it("handles unselecting all devices", () => {
      const devices = [
        deviceFactory({ system_id: "abc123" }),
        deviceFactory({ system_id: "def456" }),
      ];
      const onSelectedChange = jest.fn();
      const store = mockStore(state);
      const wrapper = mount(
        <Provider store={store}>
          <MemoryRouter>
            <CompatRouter>
              <DeviceListTable
                devices={devices}
                onSelectedChange={onSelectedChange}
                selectedIDs={["abc123", "def456"]}
              />
            </CompatRouter>
          </MemoryRouter>
        </Provider>
      );

      wrapper
        .find("[data-testid='all-devices-checkbox'] input")
        .simulate("change");

      expect(onSelectedChange).toHaveBeenCalledWith([]);
    });
  });
});
