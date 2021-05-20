import { MemoryRouter, Route } from "react-router-dom";
import { mount } from "enzyme";

import { SideNav } from "./SideNav";

describe("SideNav", () => {
  let items;

  beforeEach(() => {
    items = [
      {
        label: "Configuration",
        subNav: [
          { path: "/settings/configuration/general", label: "General" },
          {
            path: "/settings/configuration/commissioning",
            label: "Commissioning",
          },
          { path: "/settings/configuration/deploy", label: "Deploy" },
          {
            path: "/settings/configuration/kernel-parameters",
            label: "Kernel parameters",
          },
        ],
      },
      {
        path: "/settings/users",
        label: "Users",
      },
    ];
  });
  it("renders", () => {
    const wrapper = mount(
      <MemoryRouter
        initialEntries={[{ pathname: "/settings", key: "testKey" }]}
        initialIndex={0}
      >
        <Route
          component={(props) => <SideNav {...props} items={items} />}
          path="/settings"
        />
      </MemoryRouter>
    );
    expect(wrapper.find("SideNav")).toMatchSnapshot();
  });

  it("can set an active item", () => {
    const wrapper = mount(
      <MemoryRouter
        initialEntries={[{ pathname: "/settings/users", key: "testKey" }]}
        initialIndex={0}
      >
        <Route
          component={(props) => <SideNav {...props} items={items} />}
          path="/settings"
        />
      </MemoryRouter>
    );
    expect(wrapper.find("a.is-active").text()).toEqual("Users");
  });
});
