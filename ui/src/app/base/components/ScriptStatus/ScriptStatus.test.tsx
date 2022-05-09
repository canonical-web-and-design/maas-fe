import { mount, shallow } from "enzyme";

import ScriptStatus from "./ScriptStatus";

import { ScriptResultStatus } from "app/store/scriptresult/types";

describe("ScriptStatus", () => {
  it("can show a passed icon", () => {
    const wrapper = shallow(
      <ScriptStatus status={ScriptResultStatus.PASSED} />
    );
    expect(wrapper.find("Icon").prop("name")).toBe("success");
  });

  it("can show a pending icon", () => {
    const wrapper = shallow(
      <ScriptStatus status={ScriptResultStatus.PENDING} />
    );
    expect(wrapper.find("Icon").prop("name")).toBe("pending");
  });

  it("can show a running icon", () => {
    const wrapper = shallow(
      <ScriptStatus status={ScriptResultStatus.RUNNING} />
    );
    expect(wrapper.find("Icon").prop("name")).toBe("running");
  });

  it("can show a failed icon", () => {
    const wrapper = shallow(
      <ScriptStatus status={ScriptResultStatus.FAILED} />
    );
    expect(wrapper.find("Icon").prop("name")).toBe("error");
  });

  it("can show a timed out icon", () => {
    const wrapper = shallow(
      <ScriptStatus status={ScriptResultStatus.TIMEDOUT} />
    );
    expect(wrapper.find("Icon").prop("name")).toBe("timed-out");
  });

  it("can show a skipped icon", () => {
    const wrapper = shallow(
      <ScriptStatus status={ScriptResultStatus.SKIPPED} />
    );
    expect(wrapper.find("Icon").prop("name")).toBe("warning");
  });

  it("makes the icon inline if children are provided", () => {
    const wrapper = shallow(
      <ScriptStatus status={ScriptResultStatus.PASSED}>{0}</ScriptStatus>
    );
    expect(wrapper.find("Icon").prop("className")).toBe("is-inline");
  });

  it("does not make the icon inline if children are not provided", () => {
    const wrapper = shallow(
      <ScriptStatus status={ScriptResultStatus.PASSED} />
    );
    expect(wrapper.find("Icon").prop("className")).toBe("");
  });

  it("can have its icon wrapped in a tooltip", () => {
    const wrapper = mount(
      <ScriptStatus
        status={ScriptResultStatus.PASSED}
        tooltipMessage="Tooltip!"
        tooltipPosition="top-right"
      />
    );

    expect(wrapper.find("[role='tooltip']").text()).toBe("Tooltip!");
    expect(wrapper.find("[className*='p-tooltip--top-right']").exists()).toBe(
      true
    );
  });
});
