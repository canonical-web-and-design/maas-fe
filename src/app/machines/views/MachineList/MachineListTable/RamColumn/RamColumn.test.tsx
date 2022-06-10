import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import { RamColumn } from "./RamColumn";

import type { RootState } from "app/store/root/types";
import { TestStatusStatus } from "app/store/types/node";
import {
  machine as machineFactory,
  machineState as machineStateFactory,
  rootState as rootStateFactory,
  testStatus as testStatusFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("RamColumn", () => {
  let state: RootState;
  beforeEach(() => {
    state = rootStateFactory({
      machine: machineStateFactory({
        errors: {},
        loading: false,
        loaded: true,
        items: [
          machineFactory({
            system_id: "abc123",
            memory: 8,
            memory_test_status: testStatusFactory({
              status: 2,
            }),
          }),
        ],
      }),
    });
  });

  it("renders", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <RamColumn systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("RamColumn")).toMatchSnapshot();
  });

  it("displays ram amount", () => {
    state.machine.items[0].memory = 16;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <RamColumn systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[data-testid="memory"]').text()).toEqual("16");
  });

  it("displays an error and tooltip if memory tests have failed", () => {
    state.machine.items[0].memory = 16;
    state.machine.items[0].memory_test_status = testStatusFactory({
      status: TestStatusStatus.FAILED,
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <RamColumn systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("Tooltip").exists()).toBe(true);
    expect(wrapper.find(".p-icon--error").exists()).toBe(true);
  });
});
