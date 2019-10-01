import { mount } from "enzyme";
import React from "react";

import CopyButton from "./CopyButton";

describe("CopyButton ", () => {
  let execCommand;

  beforeEach(() => {
    execCommand = document.execCommand;
    document.execCommand = jest.fn();
  });

  afterEach(() => {
    document.execCommand = execCommand;
  });

  it("can render", () => {
    const wrapper = mount(<CopyButton value="Test key" />);
    expect(wrapper).toMatchSnapshot();
  });

  it("can copy a value", () => {
    const wrapper = mount(<CopyButton value="Test key" />);
    wrapper.find("Button").simulate("click");
    expect(document.execCommand).toHaveBeenCalled();
    expect(wrapper.find("input").is(":focus")).toBe(true);
  });
});
