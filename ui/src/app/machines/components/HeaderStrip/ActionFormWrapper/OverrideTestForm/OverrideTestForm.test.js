import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import React from "react";

import OverrideTestForm from "./OverrideTestForm";

const mockStore = configureStore();

describe("OverrideTestForm", () => {
  let initialState;
  beforeEach(() => {
    initialState = {
      machine: {
        errors: {},
        loading: false,
        loaded: true,
        items: [{ system_id: "abc123" }, { system_id: "def456" }],
        selected: [],
      },
      scriptresults: {
        errors: {},
        loading: false,
        loaded: true,
        items: {
          abc123: [
            {
              id: 1,
              name: "script1",
            },
            {
              id: 2,
              name: "script2",
            },
          ],
        },
      },
    };
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
          <OverrideTestForm setSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      wrapper.find("Formik").props().onSubmit({
        suprressResults: false,
      })
    );
    expect(
      store
        .getActions()
        .filter((action) => action.type === "MACHINE_OVERRIDE_FAILED_TESTING")
    ).toStrictEqual([
      {
        type: "MACHINE_OVERRIDE_FAILED_TESTING",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: "override-failed-testing",
            extra: {},
            system_id: "abc123",
          },
        },
      },
      {
        type: "MACHINE_OVERRIDE_FAILED_TESTING",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: "override-failed-testing",
            extra: {},
            system_id: "def456",
          },
        },
      },
    ]);
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
          <OverrideTestForm setSelectedAction={jest.fn()} />
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
        .filter((action) => action.type === "SET_SCRIPT_RESULT_SUPPRESSED")
    ).toStrictEqual([
      {
        meta: {
          method: "set_script_result_suppressed",
          model: "machine",
        },
        payload: {
          params: {
            script_result_ids: [1, 2],
            system_id: "abc123",
          },
        },
        type: "SET_SCRIPT_RESULT_SUPPRESSED",
      }
    ]);
  });
});
