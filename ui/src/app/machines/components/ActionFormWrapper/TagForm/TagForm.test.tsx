import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";

import TagForm from "./TagForm";

import type { RootState } from "app/store/root/types";
import { NodeActions } from "app/store/types/node";
import {
  generalState as generalStateFactory,
  machine as machineFactory,
  machineAction as machineActionFactory,
  machineActionsState as machineActionsStateFactory,
  machineState as machineStateFactory,
  machineStatus as machineStatusFactory,
  rootState as rootStateFactory,
  tagState as tagStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("TagForm", () => {
  let initialState: RootState;

  beforeEach(() => {
    initialState = rootStateFactory({
      general: generalStateFactory({
        machineActions: machineActionsStateFactory({
          data: [machineActionFactory({ name: NodeActions.TAG, title: "Tag" })],
        }),
      }),
      machine: machineStateFactory({
        loaded: true,
        items: [
          machineFactory({ system_id: "abc123" }),
          machineFactory({ system_id: "def456" }),
        ],
        statuses: {
          abc123: machineStatusFactory(),
          def456: machineStatusFactory(),
        },
      }),
      tag: tagStateFactory({
        loaded: true,
      }),
    });
  });

  it("dispatches action to fetch tags on load", () => {
    const state = { ...initialState };
    const store = mockStore(state);
    mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <TagForm actionDisabled={false} clearSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    expect(
      store.getActions().some((action) => action.type === "tag/fetch")
    ).toBe(true);
  });

  it("correctly dispatches actions to tag selected machines", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123", "def456"];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <TagForm actionDisabled={false} clearSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      wrapper
        .find("Formik")
        .props()
        .onSubmit({
          tags: ["tag1", "tag2"],
        })
    );
    expect(
      store.getActions().filter((action) => action.type === "machine/tag")
    ).toStrictEqual([
      {
        type: "machine/tag",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: NodeActions.TAG,
            extra: {
              tags: ["tag1", "tag2"],
            },
            system_id: "abc123",
          },
        },
      },
      {
        type: "machine/tag",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: NodeActions.TAG,
            extra: {
              tags: ["tag1", "tag2"],
            },
            system_id: "def456",
          },
        },
      },
    ]);
  });

  it("correctly dispatches action to tag machine from details view", () => {
    const state = { ...initialState };
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
              <TagForm actionDisabled={false} clearSelectedAction={jest.fn()} />
            )}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      wrapper
        .find("Formik")
        .props()
        .onSubmit({
          tags: ["tag1", "tag2"],
        })
    );

    expect(
      store.getActions().filter((action) => action.type === "machine/tag")
    ).toStrictEqual([
      {
        type: "machine/tag",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: NodeActions.TAG,
            extra: {
              tags: ["tag1", "tag2"],
            },
            system_id: "abc123",
          },
        },
      },
    ]);
  });
});
