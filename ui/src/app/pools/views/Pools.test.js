import { MemoryRouter } from "react-router-dom";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import Pools from "./Pools";
import {
  resourcePool as resourcePoolFactory,
  resourcePoolState as resourcePoolStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("Pools", () => {
  let initialState;

  beforeEach(() => {
    initialState = rootStateFactory({
      resourcepool: resourcePoolStateFactory({
        loaded: true,
        items: [resourcePoolFactory({ name: "default" })],
      }),
    });
  });

  it("displays a loading component if pools are loading", () => {
    const state = { ...initialState };
    state.resourcepool.loading = true;
    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/pools", key: "testKey" }]}>
          <Pools />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("Spinner").exists()).toBe(true);
  });

  it("disables the edit button without permissions", () => {
    const state = { ...initialState };
    state.resourcepool.items = [resourcePoolFactory({ permissions: [] })];
    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/pools", key: "testKey" }]}>
          <Pools />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("Button").first().props().disabled).toBe(true);
  });

  it("enables the edit button with correct permissions", () => {
    const state = { ...initialState };
    state.resourcepool.items = [resourcePoolFactory({ permissions: ["edit"] })];
    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/pools", key: "testKey" }]}>
          <Pools />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("Button").first().props().disabled).toBe(false);
  });

  it("can show a delete confirmation", () => {
    const state = { ...initialState };
    const store = mockStore(state);
    state.resourcepool.items = [
      {
        id: 0,
        name: "squambo",
        description: "a pool",
        is_default: false,
        permissions: ["delete"],
      },
    ];

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/pools", key: "testKey" }]}>
          <Pools />
        </MemoryRouter>
      </Provider>
    );

    let row = wrapper.find("MainTable").prop("rows")[0];
    expect(row.expanded).toBe(false);
    // Click on the delete button:
    wrapper.find("TableRow").at(1).find("Button").at(1).simulate("click");
    row = wrapper.find("MainTable").prop("rows")[0];
    expect(row.expanded).toBe(true);
  });

  it("can delete a pool", () => {
    const state = { ...initialState };
    const store = mockStore(state);
    state.resourcepool.items = [
      {
        id: 2,
        name: "squambo",
        description: "a pool",
        is_default: false,
        permissions: ["delete"],
      },
    ];

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/pools", key: "testKey" }]}>
          <Pools />
        </MemoryRouter>
      </Provider>
    );
    // Click on the delete button:
    wrapper.find("TableRow").at(1).find("Button").at(1).simulate("click");
    // Click on the delete confirm button
    wrapper
      .find("TableRow")
      .at(1)
      .find("ActionButton[data-test='action-confirm']")
      .simulate("click");

    expect(store.getActions()[2]).toEqual({
      type: "resourcepool/delete",
      payload: {
        params: {
          id: 2,
        },
      },
      meta: {
        model: "resourcepool",
        method: "delete",
      },
    });
  });

  it("disables the delete button for default pools", () => {
    const state = { ...initialState };
    const store = mockStore(state);
    state.resourcepool.items = [
      {
        id: 0,
        name: "default",
        description: "default",
        is_default: true,
        permissions: ["edit", "delete"],
      },
    ];
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/pools", key: "testKey" }]}>
          <Pools />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Button").at(1).props().disabled).toBe(true);
  });

  it("disables the delete button for pools that contain machines", () => {
    const state = { ...initialState };
    const store = mockStore(state);
    state.resourcepool.items = [
      {
        id: 0,
        name: "machines",
        description: "has machines",
        is_default: false,
        permissions: ["edit", "delete"],
        machine_total_count: 1,
      },
    ];
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/pools", key: "testKey" }]}>
          <Pools />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Button").at(1).props().disabled).toBe(true);
  });

  it("does not show a machine link for empty pools", () => {
    const state = { ...initialState };
    state.resourcepool.items[0].machine_total_count = 0;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/pools", key: "testKey" }]}>
          <Pools />
        </MemoryRouter>
      </Provider>
    );
    const name = wrapper.find("TableRow").at(1).find("TableCell").at(1);
    expect(name.text()).toBe("Empty pool");
  });

  it("can show a machine link for non-empty pools", () => {
    const state = { ...initialState };
    state.resourcepool.items[0].machine_total_count = 5;
    state.resourcepool.items[0].machine_ready_count = 1;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/pools", key: "testKey" }]}>
          <Pools />
        </MemoryRouter>
      </Provider>
    );
    const link = wrapper
      .find("TableRow")
      .at(1)
      .find("TableCell")
      .at(1)
      .find("Link");
    expect(link.exists()).toBe(true);
    expect(link.prop("to")).toBe("/machines?pool=%3Ddefault");
    expect(link.text()).toBe("1 of 5 ready");
  });

  it("displays state errors in a notification", () => {
    const state = { ...initialState };
    state.resourcepool.errors = "Pools are not for swimming.";
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/pools", key: "testKey" }]}>
          <Pools />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Notification p").text()).toEqual(
      "Pools are not for swimming."
    );
  });
});
