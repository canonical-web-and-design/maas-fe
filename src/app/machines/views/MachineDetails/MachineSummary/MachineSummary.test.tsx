import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter, Route, Routes } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import MachineSummary from "./MachineSummary";

import type { RootState } from "app/store/root/types";
import { NodeStatusCode } from "app/store/types/node";
import {
  machineDetails as machineDetailsFactory,
  machineState as machineStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("MachineSummary", () => {
  let state: RootState;
  beforeEach(() => {
    state = rootStateFactory({
      machine: machineStateFactory({
        items: [machineDetailsFactory({ system_id: "abc123" })],
      }),
    });
  });

  it("displays a spinner if machines are loading", () => {
    state.machine.loading = true;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <CompatRouter>
            <MachineSummary setSidePanelContent={jest.fn()} />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Spinner").exists()).toBe(true);
  });

  it("renders", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <CompatRouter>
            <MachineSummary setSidePanelContent={jest.fn()} />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("MachineSummary")).toMatchSnapshot();
  });

  it("shows workload annotations for deployed machines", () => {
    state.machine.items = [
      machineDetailsFactory({
        status_code: NodeStatusCode.DEPLOYED,
        system_id: "abc123",
      }),
    ];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: "/machine/abc123/summary", key: "testKey" },
          ]}
        >
          <CompatRouter>
            <Routes>
              <Route
                element={<MachineSummary setSidePanelContent={jest.fn()} />}
                path="/machine/:id/summary"
              />
            </Routes>
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("WorkloadCard").exists()).toBe(true);
  });

  it("shows workload annotations for allocated machines", () => {
    state.machine.items = [
      machineDetailsFactory({
        status_code: NodeStatusCode.ALLOCATED,
        system_id: "abc123",
      }),
    ];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: "/machine/abc123/summary", key: "testKey" },
          ]}
        >
          <CompatRouter>
            <Routes>
              <Route
                element={<MachineSummary setSidePanelContent={jest.fn()} />}
                path="/machine/:id/summary"
              />
            </Routes>
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("WorkloadCard").exists()).toBe(true);
  });

  it("does not show workload annotations for machines that are neither deployed nor allocated", () => {
    state.machine.items = [
      machineDetailsFactory({
        status_code: NodeStatusCode.NEW,
        system_id: "abc123",
      }),
    ];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: "/machine/abc123/summary", key: "testKey" },
          ]}
        >
          <CompatRouter>
            <Routes>
              <Route
                element={<MachineSummary setSidePanelContent={jest.fn()} />}
                path="/machine/:id/summary"
              />
            </Routes>
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("WorkloadCard").exists()).toBe(false);
  });
});
