import { shallow } from "enzyme";
import React from "react";

import StatusBar from "./StatusBar";

describe("StatusBar", () => {
  it("shows the MAAS name", () => {
    const wrapper = shallow(<StatusBar maasName="foo" version="2.7.5" />);
    expect(wrapper.find("[data-testid='status-bar-maas-name']").text()).toBe(
      "foo MAAS"
    );
  });

  it("shows the MAAS version", () => {
    const wrapper = shallow(<StatusBar maasName="foo" version="2.7.5" />);
    expect(wrapper.find("[data-testid='status-bar-version']").text()).toBe(
      "2.7.5"
    );
  });

  it("can show a status", () => {
    const wrapper = shallow(
      <StatusBar maasName="foo" status="Activating charcoal" version="2.7.5" />
    );
    expect(wrapper.find("[data-testid='status-bar-status']").text()).toBe(
      "Activating charcoal"
    );
  });
});
