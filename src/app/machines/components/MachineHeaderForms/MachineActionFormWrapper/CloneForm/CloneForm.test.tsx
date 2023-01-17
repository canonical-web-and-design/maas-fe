import reduxToolkit from "@reduxjs/toolkit";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import CloneForm from "./CloneForm";

import ActionForm from "app/base/components/ActionForm";
import { actions as machineActions } from "app/store/machine";
import {
  machine as machineFactory,
  machineDetails as machineDetailsFactory,
  machineInterface as nicFactory,
  machineState as machineStateFactory,
  machineStateList,
  machineStateListGroup,
  machineStatus as machineStatusFactory,
  machineStatuses as machineStatusesFactory,
  nodeDisk as diskFactory,
  rootState as rootStateFactory,
} from "testing/factories";
import { submitFormikForm, waitForComponentToPaint } from "testing/utils";

const mockStore = configureStore();

describe("CloneForm", () => {
  jest.spyOn(reduxToolkit, "nanoid").mockReturnValue("123456");
  it("should be submittable only when a machine and cloning config are selected", async () => {
    const machines = [
      machineFactory({ system_id: "abc123" }),
      machineDetailsFactory({
        disks: [diskFactory()],
        interfaces: [nicFactory()],
        system_id: "def456",
      }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        active: null,
        items: machines,
        loaded: true,
        selected: ["abc123"],

        lists: {
          "123456": machineStateList({
            groups: [
              machineStateListGroup({
                items: [machines[1].system_id],
              }),
            ],
            loaded: true,
          }),
        },
        statuses: machineStatusesFactory({
          abc123: machineStatusFactory(),
          def456: machineStatusFactory(),
        }),
      }),
    });
    state.fabric.loaded = true;
    state.subnet.loaded = true;
    state.vlan.loaded = true;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <CloneForm
              clearSidePanelContent={jest.fn()}
              machines={[]}
              processingCount={0}
              viewingDetails={false}
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    const isCheckboxDisabled = () =>
      wrapper.find("input[name='interfaces']").prop("disabled") === true;
    const isSubmitDisabled = () =>
      wrapper.find(".p-button--positive[type='submit']").prop("disabled") ===
      true;

    // Checkboxes and submit should be disabled at first.
    expect(isCheckboxDisabled()).toBe(true);
    expect(isSubmitDisabled()).toBe(true);

    // Select a source machine - checkbox should be enabled.
    wrapper.find("[data-testid='machine-select-row']").at(0).simulate("click");
    await waitForComponentToPaint(wrapper);
    expect(isCheckboxDisabled()).toBe(false);
    expect(isSubmitDisabled()).toBe(true);

    // Select config to clone - submit should be enabled.
    wrapper.find("input[name='interfaces']").simulate("change", {
      target: { name: "interfaces", value: true },
    });
    await waitForComponentToPaint(wrapper);
    expect(isCheckboxDisabled()).toBe(false);
    expect(isSubmitDisabled()).toBe(false);
  });

  it("shows cloning results when the form is successfully submitted", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        loaded: true,
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <CloneForm
              clearSidePanelContent={jest.fn()}
              machines={[]}
              processingCount={0}
              viewingDetails={false}
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("CloneResults").exists()).toBe(false);

    act(() => {
      const onSuccess = wrapper.find(ActionForm).prop("onSuccess");
      onSuccess && onSuccess({});
    });
    wrapper.update();
    expect(wrapper.find("CloneResults").exists()).toBe(true);
  });

  it("can dispatch an action to clone to the given machines", () => {
    const machines = [
      machineFactory({ system_id: "abc123" }),
      machineFactory({ system_id: "def456" }),
      machineFactory({ system_id: "ghi789" }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        active: null,
        items: machines,
        loaded: true,
        selected: ["abc123", "def456"],
        statuses: machineStatusesFactory({
          abc123: machineStatusFactory(),
          def456: machineStatusFactory(),
          ghi789: machineStatusFactory(),
        }),
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CompatRouter>
            <CloneForm
              clearSidePanelContent={jest.fn()}
              selectedMachines={{
                items: [machines[0].system_id, machines[1].system_id],
              }}
              viewingDetails={false}
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    submitFormikForm(wrapper, {
      interfaces: true,
      source: "ghi789",
      storage: false,
    });

    const expectedAction = machineActions.clone(
      {
        filter: { id: ["abc123", "def456"] },
        interfaces: true,
        storage: false,
        system_id: "ghi789",
      },
      "123456"
    );
    const actualAction = store
      .getActions()
      .find((action) => action.type === expectedAction.type);
    expect(expectedAction).toStrictEqual(actualAction);
  });
});
