import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import { VMS_PER_PAGE } from "../ProjectVMs";

import VMsTable from "./VMsTable";

import { PodType } from "app/store/pod/constants";
import {
  machine as machineFactory,
  machineState as machineStateFactory,
  pod as podFactory,
  podState as podStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("VMsTable", () => {
  it("shows a spinner if machines are loading", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        loading: true,
      }),
      pod: podStateFactory({
        items: [podFactory({ id: 1 })],
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/1/project", key: "testKey" }]}
        >
          <VMsTable currentPage={1} id={1} searchFilter="" />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("Spinner").exists()).toBe(true);
  });

  it("can change sort order", () => {
    const [vm1, vm2, vm3] = [
      machineFactory({ hostname: "b", pod: { id: 1, name: "pod" } }),
      machineFactory({ hostname: "c", pod: { id: 1, name: "pod" } }),
      machineFactory({ hostname: "a", pod: { id: 1, name: "pod" } }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [vm1, vm2, vm3],
      }),
      pod: podStateFactory({
        items: [podFactory({ id: 1 })],
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/1/project", key: "testKey" }]}
        >
          <VMsTable currentPage={1} id={1} searchFilter="" />
        </MemoryRouter>
      </Provider>
    );
    const getName = (index: number) =>
      wrapper.find("[data-test='name-col']").at(index).text();

    // Sorted descending by hostname by default
    expect(getName(0)).toBe("a");
    expect(getName(1)).toBe("b");
    expect(getName(2)).toBe("c");

    // Sorted ascending by hostname
    wrapper.find("[data-test='name-header']").simulate("click");
    expect(getName(0)).toBe("c");
    expect(getName(1)).toBe("b");
    expect(getName(2)).toBe("a");

    // No sort
    wrapper.find("[data-test='name-header']").simulate("click");
    expect(getName(0)).toBe("b");
    expect(getName(1)).toBe("c");
    expect(getName(2)).toBe("a");
  });

  it("can dispatch an action to select all VMs", () => {
    const pod = podFactory({ id: 1, type: PodType.LXD });
    const vms = [
      machineFactory({
        pod: { id: pod.id, name: pod.name },
        system_id: "abc123",
      }),
      machineFactory({
        pod: { id: pod.id, name: pod.name },
        system_id: "def456",
      }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: vms,
        selected: [],
      }),
      pod: podStateFactory({
        items: [pod],
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/1/project", key: "testKey" }]}
        >
          <VMsTable currentPage={1} id={1} searchFilter="" />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find("GroupCheckbox input").simulate("change", {
      target: { name: "group-checkbox", value: "checked" },
    });
    expect(
      store.getActions().find((action) => action.type === "machine/setSelected")
    ).toStrictEqual({
      type: "machine/setSelected",
      payload: ["abc123", "def456"],
    });
  });

  it("can dispatch an action to unselect all VMs", () => {
    const pod = podFactory({ id: 1, type: PodType.LXD });
    const vms = [
      machineFactory({
        pod: { id: pod.id, name: pod.name },
        system_id: "abc123",
      }),
      machineFactory({
        pod: { id: pod.id, name: pod.name },
        system_id: "def456",
      }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: vms,
        selected: ["abc123", "def456"],
      }),
      pod: podStateFactory({
        items: [pod],
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/1/project", key: "testKey" }]}
        >
          <VMsTable currentPage={1} id={1} searchFilter="" />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find("GroupCheckbox input").simulate("change", {
      target: { name: "group-checkbox", value: "checked" },
    });
    expect(
      store.getActions().find((action) => action.type === "machine/setSelected")
    ).toStrictEqual({
      type: "machine/setSelected",
      payload: [],
    });
  });

  it("paginates the VMs", () => {
    const pod = podFactory({ id: 1, type: PodType.LXD });
    // The pod has 1 more VM than what's shown per page.
    const vms = Array.from(Array(VMS_PER_PAGE + 1)).map((_, i) =>
      machineFactory({
        pod: { id: pod.id, name: pod.name },
        system_id: `${i}`,
      })
    );
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: vms,
      }),
      pod: podStateFactory({
        items: [pod],
      }),
    });
    const store = mockStore(state);
    const Proxy = ({ currentPage }: { currentPage: number }) => (
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/1/project", key: "testKey" }]}
        >
          <VMsTable currentPage={currentPage} id={1} searchFilter="" />
        </MemoryRouter>
      </Provider>
    );
    const wrapper = mount(<Proxy currentPage={1} />);
    expect(wrapper.find("tbody tr").length).toBe(VMS_PER_PAGE);

    wrapper.setProps({ currentPage: 2 });
    wrapper.update();
    expect(wrapper.find("tbody tr").length).toBe(1);
  });

  it("shows a message if no VMs match the search filter", () => {
    const pod = podFactory({ id: 1, type: PodType.LXD });
    const vms = [
      machineFactory({
        pod: { id: pod.id, name: pod.name },
        system_id: "abc123",
      }),
      machineFactory({
        pod: { id: pod.id, name: pod.name },
        system_id: "def456",
      }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: vms,
      }),
      pod: podStateFactory({
        items: [pod],
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/1/project", key: "testKey" }]}
        >
          <VMsTable currentPage={1} id={1} searchFilter="system_id:(=ghi789)" />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-test='no-vms']").exists()).toBe(true);
    expect(wrapper.find("[data-test='no-vms']").text()).toBe(
      "No VMs in this VM host match the search criteria."
    );
  });
});
