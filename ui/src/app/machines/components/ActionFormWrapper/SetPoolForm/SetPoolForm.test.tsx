import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";

import SetPoolForm from "./SetPoolForm";

import type { RootState } from "app/store/root/types";
import { NodeActions } from "app/store/types/node";
import {
  generalState as generalStateFactory,
  machine as machineFactory,
  machineAction as machineActionFactory,
  machineActionsState as machineActionsStateFactory,
  machineState as machineStateFactory,
  machineStatus as machineStatusFactory,
  resourcePool as resourcePoolFactory,
  resourcePoolState as resourcePoolStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("SetPoolForm", () => {
  let state: RootState;
  beforeEach(() => {
    state = rootStateFactory({
      general: generalStateFactory({
        machineActions: machineActionsStateFactory({
          data: [
            machineActionFactory({
              name: NodeActions.SET_POOL,
              sentence: "change those pools",
              title: "Set pool",
            }),
          ],
        }),
      }),
      machine: machineStateFactory({
        errors: {},
        loading: false,
        loaded: true,
        items: [
          machineFactory({
            system_id: "abc123",
          }),
          machineFactory({
            system_id: "def456",
          }),
        ],
        selected: [],
        statuses: {
          abc123: machineStatusFactory({ settingPool: false }),
          def456: machineStatusFactory({ settingPool: false }),
        },
      }),
      resourcepool: resourcePoolStateFactory({
        errors: {},
        items: [
          resourcePoolFactory({ id: 0, name: "default" }),
          resourcePoolFactory({ id: 1, name: "pool-1" }),
        ],
        loaded: true,
      }),
    });
  });

  it("dispatches action to fetch pools on load", () => {
    const store = mockStore(state);
    mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <SetPoolForm actionDisabled={false} clearSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    expect(
      store.getActions().some((action) => action.type === "resourcepool/fetch")
    ).toBe(true);
  });

  it("correctly dispatches actions to set pools of selected machines", () => {
    const store = mockStore(state);
    state.machine.selected = ["abc123", "def456"];
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <SetPoolForm actionDisabled={false} clearSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      wrapper.find("Formik").props().onSubmit({
        poolSelection: "select",
        name: "pool-1",
        description: "",
      })
    );
    expect(
      store.getActions().filter((action) => action.type === "machine/setPool")
    ).toStrictEqual([
      {
        type: "machine/setPool",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: NodeActions.SET_POOL,
            extra: {
              pool_id: 1,
            },
            system_id: "abc123",
          },
        },
      },
      {
        type: "machine/setPool",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: NodeActions.SET_POOL,
            extra: {
              pool_id: 1,
            },
            system_id: "def456",
          },
        },
      },
    ]);
  });

  it("correctly dispatches action to set machine pool from details view", () => {
    state.machine.active = "abc123";
    state.machine.selected = [];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <Route
            exact
            path="/machine/:id"
            component={() => (
              <SetPoolForm
                actionDisabled={false}
                clearSelectedAction={jest.fn()}
              />
            )}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      wrapper.find("Formik").props().onSubmit({
        poolSelection: "select",
        name: "pool-1",
        description: "",
      })
    );

    expect(
      store.getActions().filter((action) => action.type === "machine/setPool")
    ).toStrictEqual([
      {
        type: "machine/setPool",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: NodeActions.SET_POOL,
            extra: {
              pool_id: 1,
            },
            system_id: "abc123",
          },
        },
      },
    ]);
  });

  it("correctly dispatches action to create and set pool of selected machines", () => {
    const store = mockStore(state);
    state.machine.selected = ["abc123", "def456"];
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <SetPoolForm actionDisabled={false} clearSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      wrapper.find("Formik").props().onSubmit({
        poolSelection: "create",
        name: "pool-1",
        description: "",
      })
    );
    expect(
      store
        .getActions()
        .find((action) => action.type === "resourcepool/createWithMachines")
    ).toStrictEqual({
      type: "resourcepool/createWithMachines",
      payload: {
        params: {
          machineIDs: ["abc123", "def456"],
          pool: {
            description: "",
            name: "pool-1",
            poolSelection: "create",
          },
        },
      },
    });
  });
});
