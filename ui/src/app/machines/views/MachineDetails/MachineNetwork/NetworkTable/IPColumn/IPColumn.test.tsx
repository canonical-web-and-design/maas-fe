import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import IPColumn from "./IPColumn";

import { HardwareType } from "app/base/enum";
import type { RootState } from "app/store/root/types";
import {
  ScriptResultStatus,
  ScriptResultType,
} from "app/store/scriptresult/types";
import { NetworkLinkMode } from "app/store/types/enum";
import type { VLAN } from "app/store/vlan/types";
import {
  fabric as fabricFactory,
  fabricState as fabricStateFactory,
  machineDetails as machineDetailsFactory,
  machineInterface as machineInterfaceFactory,
  networkDiscoveredIP as networkDiscoveredIPFactory,
  networkLink as networkLinkFactory,
  nodeScriptResultState as nodeScriptResultStateFactory,
  rootState as rootStateFactory,
  scriptResult as scriptResultFactory,
  scriptResultState as scriptResultStateFactory,
  vlan as vlanFactory,
  vlanState as vlanStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("IPColumn", () => {
  let state: RootState;
  let vlan: VLAN;

  beforeEach(() => {
    const fabric = fabricFactory({ name: "fabric-name" });
    vlan = vlanFactory({ fabric: fabric.id, vid: 2, name: "vlan-name" });
    state = rootStateFactory({
      fabric: fabricStateFactory({
        items: [fabric],
      }),
      vlan: vlanStateFactory({
        items: [vlan],
      }),
    });
  });

  it("can display a discovered ip address", () => {
    const discovered = networkDiscoveredIPFactory({ ip_address: "1.2.3.99" });
    const links = [networkLinkFactory()];
    const nic = machineInterfaceFactory({
      discovered: [discovered],
      links,
      vlan_id: vlan.id,
    });
    state.machine.items = [
      machineDetailsFactory({
        interfaces: [nic],
        system_id: "abc123",
      }),
    ];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <IPColumn link={links[0]} nic={nic} systemId="abc123" />
      </Provider>
    );
    expect(wrapper.find("DoubleRow").prop("primary")).toBe(
      discovered.ip_address
    );
  });

  it("can display an ip address from a link", () => {
    const link = networkLinkFactory({
      ip_address: "1.2.3.99",
    });
    const nic = machineInterfaceFactory({
      discovered: [],
      links: [link],
      vlan_id: vlan.id,
    });
    state.machine.items = [
      machineDetailsFactory({
        interfaces: [nic],
        system_id: "abc123",
      }),
    ];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <IPColumn link={link} nic={nic} systemId="abc123" />
      </Provider>
    );
    expect(wrapper.find("DoubleRow").prop("primary")).toBe(link.ip_address);
  });

  it("displays as unconfigured when there is no link", () => {
    const nic = machineInterfaceFactory({
      discovered: [],
      links: [],
      vlan_id: vlan.id,
    });
    state.machine.items = [
      machineDetailsFactory({
        interfaces: [nic],
        system_id: "abc123",
      }),
    ];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <IPColumn nic={nic} systemId="abc123" />
      </Provider>
    );
    expect(wrapper.find("DoubleRow").prop("primary")).toBe("Unconfigured");
  });

  it("can display the link mode", () => {
    const links = [
      networkLinkFactory({
        mode: NetworkLinkMode.AUTO,
      }),
    ];
    const nic = machineInterfaceFactory({
      discovered: [],
      links,
      vlan_id: vlan.id,
    });
    state.machine.items = [
      machineDetailsFactory({
        interfaces: [nic],
        system_id: "abc123",
      }),
    ];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <IPColumn link={links[0]} nic={nic} systemId="abc123" />
      </Provider>
    );
    expect(wrapper.find("DoubleRow").prop("primary")).toBe("Auto assign");
  });

  it("can display the failed network status for multiple tests", () => {
    const links = [networkLinkFactory()];
    const nic = machineInterfaceFactory({
      discovered: [],
      links,
      vlan_id: vlan.id,
    });
    state.machine.items = [
      machineDetailsFactory({
        interfaces: [nic],
        system_id: "abc123",
      }),
    ];
    state.scriptresult = scriptResultStateFactory({
      items: [
        scriptResultFactory({
          id: 1,
          hardware_type: HardwareType.Network,
          interface: nic,
          result_type: ScriptResultType.TESTING,
          status: ScriptResultStatus.FAILED,
        }),
        scriptResultFactory({
          id: 2,
          hardware_type: HardwareType.Network,
          interface: nic,
          result_type: ScriptResultType.TESTING,
          status: ScriptResultStatus.FAILED,
        }),
      ],
    });
    state.nodescriptresult = nodeScriptResultStateFactory({
      items: { abc123: [1, 2] },
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <IPColumn link={links[0]} nic={nic} systemId="abc123" />
      </Provider>
    );
    expect(wrapper.find("DoubleRow").prop("secondary")).toBe("2 failed tests");
  });

  it("can display the failed network status for one test", () => {
    const links = [networkLinkFactory()];
    const nic = machineInterfaceFactory({
      discovered: [],
      links,
      vlan_id: vlan.id,
    });
    state.machine.items = [
      machineDetailsFactory({
        interfaces: [nic],
        system_id: "abc123",
      }),
    ];
    state.scriptresult = scriptResultStateFactory({
      items: [
        scriptResultFactory({
          id: 1,
          hardware_type: HardwareType.Network,
          interface: nic,
          name: "nic test",
          result_type: ScriptResultType.TESTING,
          status: ScriptResultStatus.FAILED,
        }),
      ],
    });
    state.nodescriptresult = nodeScriptResultStateFactory({
      items: { abc123: [1, 2] },
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <IPColumn link={links[0]} nic={nic} systemId="abc123" />
      </Provider>
    );
    expect(wrapper.find("DoubleRow").prop("secondary")).toBe("nic test failed");
  });

  it("can not display the failed network status", () => {
    const nic = machineInterfaceFactory({
      discovered: [],
      links: [networkLinkFactory()],
      vlan_id: vlan.id,
    });
    state.machine.items = [
      machineDetailsFactory({
        interfaces: [],
        system_id: "abc123",
      }),
    ];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <IPColumn nic={nic} systemId="abc123" />
      </Provider>
    );
    expect(wrapper.find("DoubleRow").prop("secondary")).toBe(null);
  });
});
