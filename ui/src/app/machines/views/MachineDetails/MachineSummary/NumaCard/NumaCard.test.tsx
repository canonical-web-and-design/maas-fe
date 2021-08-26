import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import NumaCard from "./NumaCard";

import type { RootState } from "app/store/root/types";
import {
  machineDetails as machineDetailsFactory,
  machineNumaNode as machineNumaNodeFactory,
  machineState as machineStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("NumaCard", () => {
  let state: RootState;
  beforeEach(() => {
    state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            numa_nodes: [machineNumaNodeFactory()],
            system_id: "abc123",
          }),
        ],
      }),
    });
  });

  it("renders when there are no numa nodes", () => {
    state.machine.items = [
      machineDetailsFactory({
        numa_nodes: [],
        system_id: "abc123",
      }),
    ];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <NumaCard id="abc123" />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("NumaCard .p-muted-heading").text()).toBe(
      "0 NUMA nodes"
    );
    expect(wrapper.find("NumaCard List").exists()).toBe(false);
  });

  it("renders with numa nodes", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <NumaCard id="abc123" />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("NumaCard")).toMatchSnapshot();
  });
});
