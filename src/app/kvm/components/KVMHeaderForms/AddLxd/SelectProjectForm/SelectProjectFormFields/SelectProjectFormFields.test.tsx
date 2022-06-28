import { mount } from "enzyme";
import { Formik } from "formik";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import type { NewPodValues } from "../../types";

import SelectProjectFormFields from "./SelectProjectFormFields";

import urls from "app/base/urls";
import { PodType } from "app/store/pod/constants";
import type { RootState } from "app/store/root/types";
import {
  pod as podFactory,
  podPowerParameters as powerParametersFactory,
  podProject as podProjectFactory,
  podState as podStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";
import { waitForComponentToPaint } from "testing/utils";

const mockStore = configureStore();

describe("SelectProjectFormFields", () => {
  let state: RootState;
  let newPodValues: NewPodValues;

  beforeEach(() => {
    state = rootStateFactory({
      pod: podStateFactory({
        loaded: true,
      }),
    });
    newPodValues = {
      certificate: "certificate",
      key: "key",
      name: "pod-name",
      password: "password",
      pool: "0",
      power_address: "192.168.1.1",
      zone: "0",
    };
  });

  it("shows a warning if an existing project is selected", async () => {
    const project = podProjectFactory();
    state.pod.projects = {
      "192.168.1.1": [project],
    };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/add", key: "testKey" }]}
        >
          <CompatRouter>
            <Formik
              initialValues={{ existingProject: "", newProject: "" }}
              onSubmit={jest.fn()}
            >
              <SelectProjectFormFields newPodValues={newPodValues} />
            </Formik>
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    // Check radio button for selecting existing project
    wrapper.find("input[id='existing-project']").simulate("change", {
      target: { name: "project-select", value: "checked" },
    });
    await waitForComponentToPaint(wrapper);

    expect(
      wrapper
        .find("Notification[data-testid='existing-project-warning']")
        .exists()
    ).toBe(true);
    expect(
      wrapper
        .find("Notification[data-testid='existing-project-warning']")
        .text()
    ).toBe("MAAS will recommission all VMs in the selected project.");
  });

  it("selects the first available project when switching to existing projects", async () => {
    state.pod = podStateFactory({
      items: [
        podFactory({
          power_parameters: powerParametersFactory({
            power_address: "192.168.1.1",
            project: "default",
          }),
          type: PodType.LXD,
        }),
      ],
      loaded: true,
      projects: {
        "192.168.1.1": [
          podProjectFactory({ name: "default" }), // default is in use
          podProjectFactory({ name: "other" }), // other is not
        ],
      },
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/add", key: "testKey" }]}
        >
          <CompatRouter>
            <Formik
              initialValues={{ existingProject: "", newProject: "" }}
              onSubmit={jest.fn()}
            >
              <SelectProjectFormFields newPodValues={newPodValues} />
            </Formik>
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    // Check radio button for selecting existing project
    wrapper.find("input[id='existing-project']").simulate("change", {
      target: { name: "project-select", value: "checked" },
    });
    await waitForComponentToPaint(wrapper);

    expect(
      wrapper
        .find("Input[name='existingProject'][value='default']")
        .prop("disabled")
    ).toBe(true);
    expect(
      wrapper
        .find("Input[name='existingProject'][value='other']")
        .prop("disabled")
    ).toBe(false);
    expect(
      wrapper
        .find("Input[name='existingProject'][value='other']")
        .prop("checked")
    ).toBe(true);
  });

  it("disables the existing project radio button if no existing projects are free", async () => {
    state.pod = podStateFactory({
      items: [
        podFactory({
          power_parameters: powerParametersFactory({
            power_address: "192.168.1.1",
            project: "default",
          }),
          type: PodType.LXD,
        }),
        podFactory({
          power_parameters: powerParametersFactory({
            power_address: "192.168.1.1",
            project: "other",
          }),
          type: PodType.LXD,
        }),
      ],
      loaded: true,
      projects: {
        "192.168.1.1": [
          podProjectFactory({ name: "default" }),
          podProjectFactory({ name: "other" }),
        ],
      },
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/add", key: "testKey" }]}
        >
          <CompatRouter>
            <Formik
              initialValues={{ existingProject: "", newProject: "" }}
              onSubmit={jest.fn()}
            >
              <SelectProjectFormFields newPodValues={newPodValues} />
            </Formik>
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("input[id='existing-project']").prop("disabled")).toBe(
      true
    );
  });

  it("disables radio and shows a link to an existing LXD project", async () => {
    const pod = podFactory({
      power_parameters: powerParametersFactory({
        power_address: "192.168.1.1",
        project: "default",
      }),
      type: PodType.LXD,
    });
    state.pod = podStateFactory({
      items: [pod],
      loaded: true,
      projects: {
        "192.168.1.1": [
          podProjectFactory({ name: "default" }),
          podProjectFactory({ name: "other" }),
        ],
      },
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/add", key: "testKey" }]}
        >
          <CompatRouter>
            <Formik
              initialValues={{ existingProject: "", newProject: "" }}
              onSubmit={jest.fn()}
            >
              <SelectProjectFormFields newPodValues={newPodValues} />
            </Formik>
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    // Check radio button for selecting existing project
    wrapper.find("input[id='existing-project']").simulate("change", {
      target: { name: "project-select", value: "checked" },
    });
    await waitForComponentToPaint(wrapper);

    expect(wrapper.find("[data-testid='existing-pod']").exists()).toBe(true);
    expect(wrapper.find("[data-testid='existing-pod'] Link").prop("to")).toBe(
      urls.kvm.lxd.single.index({ id: pod.id })
    );
  });
});
