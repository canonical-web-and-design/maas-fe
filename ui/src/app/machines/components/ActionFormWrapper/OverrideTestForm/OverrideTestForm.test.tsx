import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";

import OverrideTestForm from "./OverrideTestForm";

import type { RootState } from "app/store/root/types";
import {
  ScriptResultStatus,
  ScriptResultType,
} from "app/store/scriptresult/types";
import { NodeActions } from "app/store/types/node";
import {
  generalState as generalStateFactory,
  machine as machineFactory,
  machineAction as machineActionFactory,
  machineActionsState as machineActionsStateFactory,
  machineState as machineStateFactory,
  machineStatus as machineStatusFactory,
  machineStatuses as machineStatusesFactory,
  nodeScriptResultState as nodeScriptResultStateFactory,
  rootState as rootStateFactory,
  scriptResult as scriptResultFactory,
  scriptResultResult as scriptResultResultFactory,
  scriptResultState as scriptResultStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("OverrideTestForm", () => {
  let initialState: RootState;

  beforeEach(() => {
    initialState = rootStateFactory({
      general: generalStateFactory({
        machineActions: machineActionsStateFactory({
          data: [
            machineActionFactory({
              name: NodeActions.OVERRIDE_FAILED_TESTING,
              sentence: "change those pools",
            }),
          ],
        }),
      }),
      machine: machineStateFactory({
        loaded: true,
        items: [
          machineFactory({ hostname: "host1", system_id: "abc123" }),
          machineFactory({ hostname: "host2", system_id: "def456" }),
        ],
        statuses: machineStatusesFactory({
          abc123: machineStatusFactory(),
          def456: machineStatusFactory(),
        }),
      }),
      nodescriptresult: nodeScriptResultStateFactory({
        items: { abc123: [1], def456: [2] },
      }),
      scriptresult: scriptResultStateFactory({
        loaded: true,
        loading: false,
        items: [
          scriptResultFactory({
            status: ScriptResultStatus.FAILED,
            id: 1,
            result_type: ScriptResultType.TESTING,
            results: [
              scriptResultResultFactory({
                name: "script1",
              }),
              scriptResultResultFactory({
                name: "script2",
              }),
            ],
          }),
          scriptResultFactory({
            status: ScriptResultStatus.FAILED,
            id: 2,
            result_type: ScriptResultType.TESTING,
            results: [scriptResultResultFactory()],
          }),
        ],
      }),
    });
  });

  it(`displays failed tests warning without suppress tests checkbox for a single
    machine with no failed tests`, () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123"];
    state.scriptresult.items = [];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <OverrideTestForm
            actionDisabled={false}
            clearSelectedAction={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[data-test-id="failed-results-message"]').text()).toBe(
      "Machine host1 has not failed any tests. This can occur if the test suite failed to start."
    );
    expect(wrapper.find('FormikField[name="suppressTests"]').exists()).toBe(
      false
    );
  });

  it(`displays failed tests warning without suppress tests checkbox for multiple
    machines with no failed tests`, () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123", "def456"];
    state.scriptresult.items = [];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <OverrideTestForm
            actionDisabled={false}
            clearSelectedAction={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[data-test-id="failed-results-message"]').text()).toBe(
      "2 machines have not failed any tests. This can occur if the test suite failed to start."
    );
    expect(wrapper.find('FormikField[name="suppressTests"]').exists()).toBe(
      false
    );
  });

  it("displays message with link for a single machine with failed tests", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123"];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <OverrideTestForm
            actionDisabled={false}
            clearSelectedAction={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[data-test-id="failed-results-message"]').text()).toBe(
      "Machine host1 has failed 1 test."
    );
    expect(
      wrapper.find('[data-test-id="failed-results-message"] a').props().href
    ).toBe("/machine/abc123");
  });

  it("displays message for multiple machines with failed tests", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123", "def456"];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <OverrideTestForm
            actionDisabled={false}
            clearSelectedAction={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[data-test-id="failed-results-message"]').text()).toBe(
      "2 machines have failed 2 tests."
    );
  });

  it("dispatches actions to override tests for selected machines", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123", "def456"];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <OverrideTestForm
            actionDisabled={false}
            clearSelectedAction={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      wrapper.find("Formik").props().onSubmit({
        suppressResults: false,
      })
    );
    expect(
      store
        .getActions()
        .filter((action) => action.type === "machine/overrideFailedTesting")
    ).toStrictEqual([
      {
        type: "machine/overrideFailedTesting",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: NodeActions.OVERRIDE_FAILED_TESTING,
            extra: {},
            system_id: "abc123",
          },
        },
      },
      {
        type: "machine/overrideFailedTesting",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: NodeActions.OVERRIDE_FAILED_TESTING,
            extra: {},
            system_id: "def456",
          },
        },
      },
    ]);
  });

  it("dispatches actions to fetch script results", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123", "def456"];
    state.scriptresult.items = [];
    state.nodescriptresult.items = {};
    const store = mockStore(state);
    mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <OverrideTestForm
            actionDisabled={false}
            clearSelectedAction={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(
      store
        .getActions()
        .filter((action) => action.type === "scriptresult/getByMachineId")
        .length
    ).toBe(2);
  });

  it("does not dispatch actions once script results have been requested", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123", "def456"];
    state.nodescriptresult.items = { abc123: [1], def456: [2] };
    const store = mockStore(state);
    mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <OverrideTestForm
            actionDisabled={false}
            clearSelectedAction={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );
    const origionalDispatches = store
      .getActions()
      .filter((action) => action.type === "scriptresult/getByMachineId").length;
    expect(origionalDispatches).toBe(2);
    act(() => {
      // Fire a fake action so that the useEffect runs again.
      store.dispatch({ type: "" });
    });
    // There should not be any new dispatches.
    expect(
      store
        .getActions()
        .filter((action) => action.type === "scriptresult/getByMachineId")
        .length
    ).toBe(origionalDispatches);
  });

  it("dispatches actions to suppress script results for selected machines", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123", "def456"];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <OverrideTestForm
            actionDisabled={false}
            clearSelectedAction={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      wrapper.find("Formik").props().onSubmit({
        suppressResults: true,
      })
    );
    expect(
      store
        .getActions()
        .filter((action) => action.type === "machine/suppressScriptResults")
    ).toStrictEqual([
      {
        meta: {
          method: "set_script_result_suppressed",
          model: "machine",
        },
        payload: {
          params: {
            script_result_ids: [1],
            system_id: "abc123",
          },
        },
        type: "machine/suppressScriptResults",
      },
      {
        meta: {
          method: "set_script_result_suppressed",
          model: "machine",
        },
        payload: {
          params: {
            script_result_ids: [2],
            system_id: "def456",
          },
        },
        type: "machine/suppressScriptResults",
      },
    ]);
  });

  it(`correctly dispatches action to override failed testing of machine from
    details view`, () => {
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
              <OverrideTestForm
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
        suppressResults: false,
      })
    );

    expect(
      store
        .getActions()
        .filter((action) => action.type === "machine/overrideFailedTesting")
    ).toStrictEqual([
      {
        type: "machine/overrideFailedTesting",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: NodeActions.OVERRIDE_FAILED_TESTING,
            extra: {},
            system_id: "abc123",
          },
        },
      },
    ]);
  });

  it(`correctly dispatches action to suppress test results of machine from
    details view`, () => {
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
              <OverrideTestForm
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
        suppressResults: true,
      })
    );

    expect(
      store
        .getActions()
        .filter((action) => action.type === "machine/suppressScriptResults")
    ).toStrictEqual([
      {
        meta: {
          method: "set_script_result_suppressed",
          model: "machine",
        },
        payload: {
          params: {
            script_result_ids: [1],
            system_id: "abc123",
          },
        },
        type: "machine/suppressScriptResults",
      },
    ]);
  });
});
