import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import TestHistory from "./TestHistory";

import type { RootState } from "app/store/root/types";
import {
  machineState as machineStateFactory,
  machineDetails as machineDetailsFactory,
  partialScriptResult as partialScriptResultFactory,
  rootState as rootStateFactory,
  scriptResult as scriptResultFactory,
  scriptResultState as scriptResultStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("TestHistory", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory({
      machine: machineStateFactory({
        loaded: true,
        items: [
          machineDetailsFactory({
            locked: false,
            permissions: ["edit"],
            system_id: "abc123",
          }),
        ],
      }),
      scriptresult: scriptResultStateFactory({
        loaded: true,
      }),
    });
  });

  it("fetches script result history on load", () => {
    const scriptResult = scriptResultFactory({ id: 1 });
    state.scriptresult.items = [scriptResult];
    const store = mockStore(state);
    mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <CompatRouter>
            <TestHistory close={jest.fn()} scriptResult={scriptResult} />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    const actions = store.getActions();

    expect(
      actions.find((action) => action.type === "scriptresult/getHistory")
    ).toStrictEqual({
      meta: {
        method: "get_history",
        model: "noderesult",
        nocache: true,
      },
      payload: {
        params: {
          id: 1,
        },
      },
      type: "scriptresult/getHistory",
    });
  });

  it("shows a spinner if history hasn't loaded in yet", () => {
    const scriptResult = scriptResultFactory({ id: 1 });
    state.scriptresult.items = [scriptResult];
    state.scriptresult.history = {};
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <CompatRouter>
            <TestHistory close={jest.fn()} scriptResult={scriptResult} />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("Spinner").exists()).toBe(true);
  });

  it("displays a test history table if test has been run more than once", () => {
    const scriptResult = scriptResultFactory({ id: 1 });
    state.scriptresult.items = [scriptResult];
    state.scriptresult.history = {
      1: [partialScriptResultFactory(), partialScriptResultFactory()],
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <CompatRouter>
            <TestHistory close={jest.fn()} scriptResult={scriptResult} />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-testid='history-table']").exists()).toBe(true);
  });

  it("displays a link to the history details", () => {
    const scriptResult = scriptResultFactory({ id: 1 });
    state.scriptresult.items = [scriptResult];
    state.scriptresult.history = {
      1: [partialScriptResultFactory(), partialScriptResultFactory()],
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <CompatRouter>
            <TestHistory close={jest.fn()} scriptResult={scriptResult} />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-testid='details-link']").exists()).toBe(true);
  });

  it("displays a message if the test has no history", () => {
    const scriptResult = scriptResultFactory({ id: 1 });
    state.scriptresult.items = [scriptResult];
    state.scriptresult.history = {
      1: [partialScriptResultFactory()],
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <CompatRouter>
            <TestHistory close={jest.fn()} scriptResult={scriptResult} />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-testid='no-history']").exists()).toBe(true);
  });
});
