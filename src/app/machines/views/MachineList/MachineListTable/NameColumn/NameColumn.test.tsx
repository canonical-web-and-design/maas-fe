import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import { NameColumn } from "./NameColumn";

import type { RootState } from "app/store/root/types";
import { NodeStatus } from "app/store/types/node";
import {
  modelRef as modelRefFactory,
  machine as machineFactory,
  machineState as machineStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("NameColumn", () => {
  let state: RootState;
  beforeEach(() => {
    state = rootStateFactory({
      machine: machineStateFactory({
        loaded: true,
        items: [
          machineFactory({
            domain: modelRefFactory({
              name: "example",
            }),
            extra_macs: [],
            hostname: "koala",
            ip_addresses: [],
            pool: modelRefFactory(),
            pxe_mac: "00:11:22:33:44:55",
            status: NodeStatus.RELEASING,
            system_id: "abc123",
            zone: modelRefFactory(),
          }),
        ],
      }),
    });
  });

  it("can be locked", () => {
    state.machine.items[0].locked = true;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <NameColumn groupValue={null} systemId="abc123" />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find(".p-icon--locked").exists()).toBe(true);
  });

  it("can show the FQDN", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <NameColumn groupValue={null} systemId="abc123" />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("a").text()).toEqual("koala.example");
  });

  it("can show a single ip address", () => {
    state.machine.items[0].ip_addresses = [{ ip: "127.0.0.1", is_boot: false }];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <NameColumn groupValue={null} systemId="abc123" />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find('[data-testid="ip-addresses"]').text()).toBe(
      "127.0.0.1"
    );
    // Doesn't show tooltip.
    expect(wrapper.find("Tooltip").exists()).toBe(false);
  });

  it("can show multiple ip addresses", () => {
    state.machine.items[0].ip_addresses = [
      { ip: "127.0.0.1", is_boot: false },
      { ip: "127.0.0.2", is_boot: false },
    ];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <NameColumn groupValue={null} systemId="abc123" />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find('[data-testid="ip-addresses"]').text()).toBe(
      "127.0.0.1"
    );
    expect(wrapper.find("Button").text()).toBe("+1");
    // Shows a tooltip.
    expect(wrapper.find("Tooltip").exists()).toBe(true);
  });

  it("can show a PXE ip address", () => {
    state.machine.items[0].ip_addresses = [{ is_boot: true, ip: "127.0.0.1" }];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <NameColumn groupValue={null} systemId="abc123" />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find('[data-testid="ip-addresses"]').text()).toBe(
      "127.0.0.1 (PXE)"
    );
  });

  it("doesn't show duplicate ip addresses", () => {
    state.machine.items[0].ip_addresses = [
      { ip: "127.0.0.1", is_boot: false },
      { ip: "127.0.0.1", is_boot: false },
    ];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <NameColumn groupValue={null} systemId="abc123" />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find('[data-testid="ip-addresses"]').text()).toBe(
      "127.0.0.1"
    );
    // Doesn't show toolip.
    expect(wrapper.find("Tooltip").exists()).toBe(false);
  });

  it("can show a single mac address", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <NameColumn groupValue={null} showMAC={true} systemId="abc123" />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("a").text()).toEqual("00:11:22:33:44:55");
  });

  it("can show multiple mac address", () => {
    state.machine.items[0].extra_macs = ["aa:bb:cc:dd:ee:ff"];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <NameColumn groupValue={null} showMAC={true} systemId="abc123" />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("a").length).toEqual(2);
    expect(wrapper.find("a").at(1).text()).toEqual(" (+1)");
  });

  it("can render a machine with minimal data", () => {
    state.machine.items[0] = machineFactory({
      domain: modelRefFactory({
        name: "example",
      }),
      hostname: "koala",
      system_id: "abc123",
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <NameColumn groupValue={null} systemId="abc123" />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("NameColumn").exists()).toBe(true);
  });

  it("can render a machine in the MAC state with minimal data", () => {
    state.machine.items[0] = machineFactory({
      domain: modelRefFactory({
        name: "example",
      }),
      hostname: "koala",
      system_id: "abc123",
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <NameColumn groupValue={null} showMAC={true} systemId="abc123" />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("NameColumn").exists()).toBe(true);
  });

  it("does not render checkbox if onToggleMenu not provided", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <NameColumn groupValue={null} systemId="abc123" />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Input").exists()).toBe(false);
  });
});
