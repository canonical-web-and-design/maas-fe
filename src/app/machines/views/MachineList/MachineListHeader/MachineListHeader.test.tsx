import { ContextualMenu } from "@canonical/react-components";
import reduxToolkit from "@reduxjs/toolkit";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import MachineListHeader from "./MachineListHeader";

import { MachineHeaderViews } from "app/machines/constants";
import type { RootState } from "app/store/root/types";
import { NodeActions } from "app/store/types/node";
import {
  machine as machineFactory,
  machineStateCount as machineStateCountFactory,
  machineStateCounts as machineStateCountsFactory,
  machineState as machineStateFactory,
  machineStatus as machineStatusFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("MachineListHeader", () => {
  let state: RootState;

  beforeEach(() => {
    jest.spyOn(reduxToolkit, "nanoid").mockReturnValue("mocked-nanoid");
    state = rootStateFactory({
      machine: machineStateFactory({
        counts: machineStateCountsFactory({
          "mocked-nanoid": machineStateCountFactory({
            count: 2,
            loaded: true,
            loading: false,
          }),
        }),
        items: [
          machineFactory({ system_id: "abc123" }),
          machineFactory({ system_id: "def456" }),
        ],
        statuses: {
          abc123: machineStatusFactory({}),
          def456: machineStatusFactory({}),
        },
      }),
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("displays a loader if machines have not loaded", () => {
    state.machine.counts = machineStateCountsFactory({
      "mocked-nanoid": machineStateCountFactory({
        count: 2,
        loaded: false,
        loading: true,
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <MachineListHeader
              headerContent={null}
              setHeaderContent={jest.fn()}
              setSearchFilter={jest.fn()}
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Spinner").exists()).toBe(true);
  });

  it("displays a machine count if machines have loaded", () => {
    state.machine.loaded = true;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <MachineListHeader
              headerContent={null}
              setHeaderContent={jest.fn()}
              setSearchFilter={jest.fn()}
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find('[data-testid="section-header-subtitle"]').text()).toBe(
      "2 machines available"
    );
  });

  it("displays a selected machine filter button if some machines have been selected", () => {
    state.machine.loaded = true;
    // TODO: This state can be remove once the count has been updated to use the
    // new API:
    // https://github.com/canonical/app-tribe/issues/1102
    state.machine.selected = ["abc123"];
    state.machine.selectedMachines = { items: ["abc123"] };
    const setSearchFilter = jest.fn();
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <MachineListHeader
              headerContent={null}
              setHeaderContent={jest.fn()}
              setSearchFilter={setSearchFilter}
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find('[data-testid="section-header-subtitle"]').text()).toBe(
      "1 of 2 machines selected"
    );
    wrapper
      .find('[data-testid="section-header-subtitle"] Button')
      .simulate("click");
    expect(setSearchFilter).toHaveBeenCalledWith("in:(Selected)");
  });

  it("displays a message when all machines have been selected", () => {
    state.machine.loaded = true;
    // TODO: This state can be remove once the count has been updated to use the
    // new API:
    // https://github.com/canonical/app-tribe/issues/1102
    state.machine.selected = ["abc123", "def456"];
    state.machine.selectedMachines = { items: ["abc123", "def456"] };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <MachineListHeader
              headerContent={null}
              setHeaderContent={jest.fn()}
              setSearchFilter={jest.fn()}
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find('[data-testid="section-header-subtitle"]').text()).toBe(
      "All machines selected"
    );
  });

  it("disables the add hardware menu when machines are selected", () => {
    state.machine.selectedMachines = { items: ["abc123"] };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <MachineListHeader
              headerContent={null}
              setHeaderContent={jest.fn()}
              setSearchFilter={jest.fn()}
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper
        .find('[data-testid="add-hardware-dropdown"]')
        .find(ContextualMenu)
        .props().toggleDisabled
    ).toBe(true);
  });

  it("displays the action title if an action is selected", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <MachineListHeader
              headerContent={{ view: MachineHeaderViews.DEPLOY_MACHINE }}
              setHeaderContent={jest.fn()}
              setSearchFilter={jest.fn()}
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find('[data-testid="section-header-title"]').text()).toBe(
      "Deploy"
    );
  });

  it("displays a new label for the tag action", () => {
    // Set a selected machine so the take action menu becomes enabled.
    state.machine.selectedMachines = { items: ["abc123"] };
    // A machine needs the tag action for it to appear in the menu.
    state.machine.items = [
      machineFactory({ system_id: "abc123", actions: [NodeActions.TAG] }),
    ];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <MachineListHeader
              headerContent={null}
              setHeaderContent={jest.fn()}
              setSearchFilter={jest.fn()}
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    // Open the take action menu.
    wrapper
      .find(
        '[data-testid="take-action-dropdown"] button.p-contextual-menu__toggle'
      )
      .simulate("click");
    expect(
      wrapper
        .find("button[data-testid='action-link-tag']")
        .text()
        .includes("(NEW)")
    ).toBe(true);
  });

  it("hides the tag action's new label after it has been clicked", () => {
    // Set a selected machine so the take action menu becomes enabled.
    state.machine.selectedMachines = { items: ["abc123"] };
    // A machine needs the tag action for it to appear in the menu.
    state.machine.items = [
      machineFactory({ system_id: "abc123", actions: [NodeActions.TAG] }),
    ];
    const store = mockStore(state);
    const Header = () => (
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <MachineListHeader
              headerContent={null}
              setHeaderContent={jest.fn()}
              setSearchFilter={jest.fn()}
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    let wrapper = mount(<Header />);
    // Open the take action menu.
    wrapper
      .find(
        '[data-testid="take-action-dropdown"] button.p-contextual-menu__toggle'
      )
      .simulate("click");
    const tagAction = wrapper.find("button[data-testid='action-link-tag']");
    // The new label should appear before being clicked.
    expect(tagAction.text().includes("(NEW)")).toBe(true);
    tagAction.simulate("click");
    // Render the header again
    wrapper = mount(<Header />);
    // Open the take action menu.
    wrapper
      .find(
        '[data-testid="take-action-dropdown"] button.p-contextual-menu__toggle'
      )
      .simulate("click");
    // The new label should now be hidden.
    expect(
      wrapper
        .find("button[data-testid='action-link-tag']")
        .text()
        .includes("(NEW)")
    ).toBe(false);
  });
});
