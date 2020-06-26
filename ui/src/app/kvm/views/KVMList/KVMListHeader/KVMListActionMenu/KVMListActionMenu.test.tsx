import { MemoryRouter } from "react-router-dom";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import React from "react";

import KVMListActionMenu from "./KVMListActionMenu";

const mockStore = configureStore();

describe("KVMListActionMenu", () => {
  let initialState;
  beforeEach(() => {
    initialState = {
      pod: {
        items: [],
        selected: [],
      },
    };
  });

  it("is disabled with tooltip if no KVMs are selected", () => {
    const state = { ...initialState };
    state.pod.selected = [];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <KVMListActionMenu setSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper.find('[data-test="action-dropdown"] button').prop("disabled")
    ).toBe(true);
    expect(wrapper.find("Tooltip").prop("message")).toBe(
      "Select KVMs below to perform an action."
    );
  });

  it("is enabled if at least one KVM is selected", () => {
    const state = { ...initialState };
    state.pod.items = [
      { id: 1, name: "pod-1", type: "lxd" },
      { id: 2, name: "pod-2", type: "virsh" },
    ];
    state.pod.selected = [1];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <KVMListActionMenu setSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper.find('[data-test="action-dropdown"] button').props().disabled
    ).toBe(false);
    expect(wrapper.find("Tooltip").prop("message")).toBe(undefined);
  });
});
