import { shallow } from "enzyme";

import SettingsTable from "./SettingsTable";

describe("SettingsTable", () => {
  it("can render", () => {
    const wrapper = shallow(
      <SettingsTable
        buttons={[
          { label: "Add PPA", url: "/settings/repositories/add/ppa" },
          {
            label: "Add repository",
            url: "/settings/repositories/add/repository",
          },
        ]}
        loaded={true}
        loading={false}
        searchOnChange={jest.fn()}
        searchPlaceholder="Search"
        searchText=""
      />
    );
    expect(wrapper.find("FormCardButtons")).toMatchSnapshot();
  });

  it("can show the loading state", () => {
    const wrapper = shallow(
      <SettingsTable
        buttons={[
          { label: "Add PPA", url: "/settings/repositories/add/ppa" },
          {
            label: "Add repository",
            url: "/settings/repositories/add/repository",
          },
        ]}
        loaded={false}
        loading={true}
      />
    );
    expect(wrapper.find("Spinner").exists()).toBe(true);
    expect(wrapper.find(".settings-table__lines").exists()).toBe(true);
    expect(wrapper.find("MainTable").prop("rows")).toBe(null);
  });

  it("can display without search", () => {
    const wrapper = shallow(
      <SettingsTable
        buttons={[
          { label: "Add PPA", url: "/settings/repositories/add/ppa" },
          {
            label: "Add repository",
            url: "/settings/repositories/add/repository",
          },
        ]}
        loaded={false}
        loading={true}
      />
    );

    expect(wrapper.find(".p-table-actions__space-left").exists()).toBe(true);
    expect(wrapper.find("SearchBox").exists()).toBe(false);
  });
});

it("can render a disabled button ", () => {
  const wrapper = shallow(
    <SettingsTable
      buttons={[{ label: "Add User", url: "/foo", disabled: true }]}
      loaded={false}
      loading={true}
    />
  );

  expect(wrapper.find("Button").props().disabled).toBe(true);
});

it("can render a button with a tooltip", () => {
  const tooltip = "Add a user to MAAS";
  const wrapper = shallow(
    <SettingsTable
      buttons={[{ label: "Add User", url: "/foo", tooltip }]}
      loaded={false}
      loading={true}
    />
  );

  expect(wrapper.find("Tooltip").prop("message")).toEqual(tooltip);
});
