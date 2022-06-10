import { shallow, mount } from "enzyme";

import TableHeader from "./TableHeader";

import { SortDirection } from "app/base/types";

describe("TableHeader ", () => {
  it("renders a div if no onClick prop is present", () => {
    const wrapper = shallow(<TableHeader>Text</TableHeader>);
    expect(wrapper.find("Button").exists()).toBe(false);
    expect(wrapper.find("div").exists()).toBe(true);
  });

  it("renders a Button if onClick prop is present", () => {
    const mockFn = jest.fn();
    const wrapper = shallow(<TableHeader onClick={mockFn}>Text</TableHeader>);
    expect(wrapper.find("Button").exists()).toBe(true);

    wrapper.find("Button").simulate("click");
    expect(mockFn).toHaveBeenCalled();
  });

  it("renders a contextual icon if currentSort.key matches sortKey", () => {
    const currentSort = {
      key: "key",
      direction: SortDirection.DESCENDING,
    };
    const wrapper = mount(
      <TableHeader
        currentSort={currentSort}
        onClick={jest.fn()}
        sortKey={"key"}
      >
        Text
      </TableHeader>
    );
    expect(wrapper.find(".p-icon--chevron-down").exists()).toBe(true);
  });

  it(`renders a flipped contextual icon if currentSort.key matches sortKey
    and direction is ascending`, () => {
    const currentSort = {
      key: "key",
      direction: SortDirection.ASCENDING,
    };
    const wrapper = mount(
      <TableHeader
        currentSort={currentSort}
        onClick={jest.fn()}
        sortKey={"key"}
      >
        Text
      </TableHeader>
    );
    expect(wrapper.find(".p-icon--chevron-up").exists()).toBe(true);
  });
});
