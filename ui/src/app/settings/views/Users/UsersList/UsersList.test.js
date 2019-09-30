import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import React from "react";

import UsersList from "./UsersList";

const mockStore = configureStore();

describe("UsersList", () => {
  let defaultStore, users;

  beforeEach(() => {
    users = [
      {
        email: "admin@example.com",
        first_name: "Kangaroo",
        global_permissions: ["machine_create"],
        id: 1,
        is_superuser: true,
        last_name: "",
        sshkeys_count: 0,
        username: "admin"
      },
      {
        email: "user@example.com",
        first_name: "Koala",
        global_permissions: ["machine_create"],
        id: 2,
        is_superuser: false,
        last_name: "",
        sshkeys_count: 0,
        username: "user1"
      }
    ];
    defaultStore = {
      user: {
        auth: {
          user: users[0]
        },
        loading: false,
        loaded: true,
        items: users
      }
    };
  });

  it("displays a loading component if loading", () => {
    defaultStore.user.loading = true;
    const store = mockStore(defaultStore);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/settings/users", key: "testKey" }]}
        >
          <UsersList />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Loader").exists()).toBe(true);
  });

  it("hides the table if no users have loaded", () => {
    defaultStore.user.loaded = false;
    const store = mockStore(defaultStore);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/settings/users", key: "testKey" }]}
        >
          <UsersList />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("MainTable").exists()).toBe(false);
  });

  it("shows the table if there are users", () => {
    const store = mockStore(defaultStore);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/settings/users", key: "testKey" }]}
        >
          <UsersList />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("MainTable").exists()).toBe(true);
  });

  it("can show a delete confirmation", () => {
    const store = mockStore(defaultStore);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/settings/users", key: "testKey" }]}
        >
          <UsersList />
        </MemoryRouter>
      </Provider>
    );
    let row = wrapper.find("MainTable").prop("rows")[1];
    expect(row.expanded).toBe(false);
    // Click on the delete button:
    wrapper
      .find("TableRow")
      .at(2)
      .find("Button")
      .at(1)
      .simulate("click");
    row = wrapper.find("MainTable").prop("rows")[1];
    expect(row.expanded).toBe(true);
  });

  it("can delete a user", () => {
    const store = mockStore(defaultStore);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/settings/users", key: "testKey" }]}
        >
          <UsersList />
        </MemoryRouter>
      </Provider>
    );
    // Click on the delete button:
    wrapper
      .find("TableRow")
      .at(2)
      .find("Button")
      .at(1)
      .simulate("click");
    // Click on the delete confirm button
    wrapper
      .find("TableRow")
      .at(2)
      .find("Button")
      .at(3)
      .simulate("click");
    expect(store.getActions()[1]).toEqual({
      type: "DELETE_USER",
      payload: {
        params: {
          id: 2
        }
      },
      meta: {
        model: "user",
        method: "delete"
      }
    });
  });

  it("disables delete for the current user", () => {
    const store = mockStore(defaultStore);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/settings/users", key: "testKey" }]}
        >
          <UsersList />
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper
        .find("tbody TableRow")
        .at(0)
        .find("Button")
        .at(1)
        .prop("disabled")
    ).toBe(true);
  });

  it("links to preferences for the current user", () => {
    const store = mockStore(defaultStore);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/settings/users", key: "testKey" }]}
        >
          <UsersList />
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper
        .find("tbody TableRow")
        .at(0)
        .find("Button")
        .at(0)
        .prop("to")
    ).toBe("/account/prefs/details");
  });

  it("can add a message when a user is deleted", () => {
    defaultStore.user.saved = true;
    const store = mockStore(defaultStore);
    mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/settings/users", key: "testKey" }]}
        >
          <UsersList />
        </MemoryRouter>
      </Provider>
    );
    const actions = store.getActions();
    expect(actions.some(action => action.type === "CLEANUP_USER")).toBe(true);
    expect(actions.some(action => action.type === "ADD_MESSAGE")).toBe(true);
  });

  it("can filter users", () => {
    const store = mockStore(defaultStore);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/settings/users", key: "testKey" }]}
        >
          <UsersList />
        </MemoryRouter>
      </Provider>
    );
    let rows = wrapper.find("MainTable").prop("rows");
    expect(rows.length).toBe(2);
    act(() =>
      wrapper
        .find("SearchBox")
        .props()
        .onChange("admin")
    );
    wrapper.update();
    rows = wrapper.find("MainTable").prop("rows");
    expect(rows.length).toBe(1);
  });

  it("can toggle username and real name", () => {
    const store = mockStore(defaultStore);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/settings/users", key: "testKey" }]}
        >
          <UsersList />
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper
        .find("TableRow")
        .at(2)
        .find("TableCell")
        .at(0)
        .text()
    ).toEqual("user1");
    // Click on the header toggle.
    wrapper
      .find(".p-table-multi-header__link")
      .at(2)
      .simulate("click");
    expect(
      wrapper
        .find("TableRow")
        .at(2)
        .find("TableCell")
        .at(0)
        .text()
    ).toEqual("Kangaroo");
  });
});
