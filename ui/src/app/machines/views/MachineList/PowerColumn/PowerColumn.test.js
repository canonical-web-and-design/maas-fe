import { MemoryRouter } from "react-router-dom";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import React from "react";

import PowerColumn from "./PowerColumn";

const mockStore = configureStore();

describe("PowerColumn", () => {
  let state;
  beforeEach(() => {
    state = {
      config: {
        items: []
      },
      machine: {
        errors: {},
        loading: false,
        loaded: true,
        items: [
          {
            actions: [],
            system_id: "abc123",
            power_state: "on",
            power_type: "virsh"
          }
        ]
      }
    };
  });

  it("renders", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <PowerColumn systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("PowerColumn")).toMatchSnapshot();
  });

  it("displays the correct power state", () => {
    state.machine.items[0].power_state = "off";
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <PowerColumn systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[data-test="power_state"]').text()).toEqual("off");
  });

  it("displays the correct power type", () => {
    state.machine.items[0].power_type = "manual";
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <PowerColumn systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find('[data-test="power_type"]').text()).toEqual("manual");
  });

  it("can show a menu item to turn a machine on", () => {
    state.machine.items[0].actions = ["on"];
    state.machine.items[0].power_state = "off";
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <PowerColumn systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu so the elements get rendered.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(
      wrapper
        .find(".p-contextual-menu__link")
        .at(0)
        .text()
    ).toEqual("Turn on");
  });

  it("can show a menu item to turn a machine off", () => {
    state.machine.items[0].actions = ["off"];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <PowerColumn systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu so the elements get rendered.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(
      wrapper
        .find(".p-contextual-menu__link")
        .at(0)
        .text()
    ).toEqual("Turn off");
  });

  it("can show a menu item to check power", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <PowerColumn systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu so the elements get rendered.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(
      wrapper
        .find(".p-contextual-menu__link")
        .at(0)
        .text()
    ).toEqual("Check power");
  });

  it("can show a message when there are no menu items", () => {
    state.machine.items[0].power_state = "unknown";
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <PowerColumn systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu so the elements get rendered.
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(
      wrapper
        .find(".p-contextual-menu__link")
        .at(1)
        .text()
    ).toEqual("No power actions available");
  });
});
