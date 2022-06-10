import { shallow } from "enzyme";

import FormCard from "./FormCard";

import { COL_SIZES } from "app/base/constants";

describe("FormCard ", () => {
  it("renders", () => {
    const wrapper = shallow(<FormCard title="Add user">Content</FormCard>);
    expect(wrapper).toMatchSnapshot();
  });

  it("can display the heading on a separate row", () => {
    const wrapper = shallow(
      <FormCard stacked title="Add user">
        Content
      </FormCard>
    );
    expect(wrapper.find("Col").exists()).toBe(false);
  });

  it("decreases content column size if sidebar or title is present", () => {
    const { CARD_TITLE, SIDEBAR, TOTAL } = COL_SIZES;
    const withNeither = shallow(
      <FormCard sidebar={false} title={null}>
        Content
      </FormCard>
    );
    const withTitle = shallow(
      <FormCard sidebar={false} title="Title">
        Content
      </FormCard>
    );
    const withSidebar = shallow(
      <FormCard sidebar title={null}>
        Content
      </FormCard>
    );
    const withBoth = shallow(
      <FormCard sidebar title="Title">
        Content
      </FormCard>
    );

    expect(withNeither.find("[data-testid='content']").prop("size")).toBe(
      TOTAL
    );
    expect(withTitle.find("[data-testid='content']").prop("size")).toBe(
      TOTAL - CARD_TITLE
    );
    expect(withSidebar.find("[data-testid='content']").prop("size")).toBe(
      TOTAL - SIDEBAR
    );
    expect(withBoth.find("[data-testid='content']").prop("size")).toBe(
      TOTAL - CARD_TITLE - SIDEBAR
    );
  });
});
