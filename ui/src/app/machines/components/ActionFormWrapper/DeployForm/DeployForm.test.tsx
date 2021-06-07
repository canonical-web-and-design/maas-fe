import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";

import DeployForm from "./DeployForm";

import * as hooks from "app/base/hooks";
import { PodType } from "app/store/pod/types";
import type { RootState } from "app/store/root/types";
import { NodeActions } from "app/store/types/node";
import {
  config as configFactory,
  configState as configStateFactory,
  defaultMinHweKernelState as defaultMinHweKerelStateFactory,
  generalState as generalStateFactory,
  machine as machineFactory,
  machineAction as machineActionFactory,
  machineActionsState as machineActionsStateFactory,
  machineState as machineStateFactory,
  machineStatus as machineStatusFactory,
  osInfoState as osInfoStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("DeployForm", () => {
  let initialState: RootState;

  beforeEach(() => {
    initialState = rootStateFactory({
      config: configStateFactory({
        items: [
          configFactory({
            name: "default_osystem",
            value: "ubuntu",
            choices: [
              ["centos", "CentOS"],
              ["ubuntu", "Ubuntu"],
            ],
          }),
          configFactory({
            name: "enable_analytics",
            value: true,
          }),
        ],
      }),
      general: generalStateFactory({
        defaultMinHweKernel: defaultMinHweKerelStateFactory({
          data: "ga-18.04",
          loaded: true,
        }),
        machineActions: machineActionsStateFactory({
          data: [
            machineActionFactory({
              name: NodeActions.DEPLOY,
              title: "Deploy",
            }),
          ],
        }),
        osInfo: osInfoStateFactory({
          data: {
            osystems: [
              ["centos", "CentOS"],
              ["ubuntu", "Ubuntu"],
            ],
            releases: [
              ["centos/centos66", "CentOS 6"],
              ["centos/centos70", "CentOS 7"],
              ["ubuntu/bionic", 'Ubuntu 18.04 LTS "Bionic Beaver"'],
              ["ubuntu/focal", 'Ubuntu 20.04 LTS "Focal Fossa"'],
            ],
            kernels: {
              ubuntu: {
                bionic: [
                  ["ga-18.04", "bionic (ga-18.04)"],
                  ["ga-18.04-lowlatency", "bionic (ga-18.04-lowlatency)"],
                  ["hwe-18.04", "bionic (hwe-18.04)"],
                  ["hwe-18.04-edge", "bionic (hwe-18.04-edge)"],
                  ["hwe-18.04-lowlatency", "bionic (hwe-18.04-lowlatency)"],
                  [
                    "hwe-18.04-lowlatency-edge",
                    "bionic (hwe-18.04-lowlatency-edge)",
                  ],
                ],
                focal: [
                  ["ga-20.04", "focal (ga-20.04)"],
                  ["ga-20.04-lowlatency", "focal (ga-20.04-lowlatency)"],
                ],
              },
            },
            default_osystem: "ubuntu",
            default_release: "bionic",
          },
          loaded: true,
        }),
      }),
      machine: machineStateFactory({
        items: [
          machineFactory({ system_id: "abc123" }),
          machineFactory({ system_id: "def456" }),
        ],
        statuses: {
          abc123: machineStatusFactory(),
          def456: machineStatusFactory(),
        },
      }),
    });
  });

  it("fetches the necessary data on load", () => {
    const state = { ...initialState };
    const store = mockStore(state);
    mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DeployForm clearSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    const expectedActions = [
      "general/fetchDefaultMinHweKernel",
      "general/fetchOsInfo",
    ];

    expectedActions.forEach((expectedAction) => {
      expect(
        store.getActions().some((action) => action.type === expectedAction)
      );
    });
  });

  it("correctly dispatches actions to deploy selected machines", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123", "def456"];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DeployForm clearSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      wrapper.find("Formik").props().onSubmit({
        oSystem: "ubuntu",
        release: "bionic",
        kernel: "",
        vmHostType: "",
      })
    );
    expect(
      store.getActions().filter((action) => action.type === "machine/deploy")
    ).toStrictEqual([
      {
        type: "machine/deploy",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: NodeActions.DEPLOY,
            extra: {
              osystem: "ubuntu",
              distro_series: "bionic",
              hwe_kernel: "",
            },
            system_id: "abc123",
          },
        },
      },
      {
        type: "machine/deploy",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: NodeActions.DEPLOY,
            extra: {
              osystem: "ubuntu",
              distro_series: "bionic",
              hwe_kernel: "",
            },
            system_id: "def456",
          },
        },
      },
    ]);
  });

  it("correctly dispatches action to deploy machine from details view", () => {
    const state = { ...initialState };
    state.machine.active = "abc123";
    state.machine.selected = [];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <Route
            exact
            path="/machine/:id"
            component={() => <DeployForm clearSelectedAction={jest.fn()} />}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      wrapper.find("Formik").props().onSubmit({
        oSystem: "ubuntu",
        release: "bionic",
        kernel: "",
        vmHostType: "",
      })
    );

    expect(
      store.getActions().filter((action) => action.type === "machine/deploy")
    ).toStrictEqual([
      {
        type: "machine/deploy",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: NodeActions.DEPLOY,
            extra: {
              osystem: "ubuntu",
              distro_series: "bionic",
              hwe_kernel: "",
            },
            system_id: "abc123",
          },
        },
      },
    ]);
  });

  it("can deploy with user-data", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123"];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DeployForm clearSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    act(() =>
      wrapper.find("Formik").props().onSubmit({
        includeUserData: true,
        kernel: "",
        oSystem: "ubuntu",
        release: "bionic",
        userData: "test script",
        vmHostType: "",
      })
    );
    expect(
      store.getActions().filter((action) => action.type === "machine/deploy")
    ).toStrictEqual([
      {
        type: "machine/deploy",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: NodeActions.DEPLOY,
            extra: {
              osystem: "ubuntu",
              distro_series: "bionic",
              hwe_kernel: "",
              user_data: "test script",
            },
            system_id: "abc123",
          },
        },
      },
    ]);
  });

  it("ignores user-data if the cloud-init option is not checked", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123"];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DeployForm clearSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    act(() =>
      wrapper.find("Formik").props().onSubmit({
        includeUserData: false,
        kernel: "",
        oSystem: "ubuntu",
        release: "bionic",
        userData: "",
        vmHostType: "",
      })
    );
    expect(
      store.getActions().filter((action) => action.type === "machine/deploy")
    ).toStrictEqual([
      {
        type: "machine/deploy",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: NodeActions.DEPLOY,
            extra: {
              osystem: "ubuntu",
              distro_series: "bionic",
              hwe_kernel: "",
            },
            system_id: "abc123",
          },
        },
      },
    ]);
  });

  it("sends an analytics event with cloud-init user data set", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123"];
    const mockSendAnalytics = jest.fn();
    const mockUseSendAnalytics = (hooks.useSendAnalytics = jest.fn(
      () => mockSendAnalytics
    ));
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DeployForm clearSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      wrapper.find("Formik").props().onSubmit({
        includeUserData: true,
        kernel: "",
        oSystem: "ubuntu",
        release: "bionic",
        userData: "test script",
        vmHostType: "",
      })
    );

    expect(mockSendAnalytics).toHaveBeenCalled();
    expect(mockSendAnalytics.mock.calls[0]).toEqual([
      "Machine list deploy form",
      "Has cloud-init config",
      "Cloud-init user data",
    ]);
    mockUseSendAnalytics.mockRestore();
  });

  it("can register a LXD VM host", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123"];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DeployForm clearSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    act(() =>
      wrapper.find("Formik").props().onSubmit({
        kernel: "",
        oSystem: "ubuntu",
        release: "bionic",
        vmHostType: PodType.LXD,
      })
    );
    const action = store
      .getActions()
      .find((action) => action.type === "machine/deploy");
    expect(action?.payload?.params?.extra?.register_vmhost).toBe(true);
    expect(action?.payload?.params?.extra?.install_kvm).toBeUndefined();
  });

  it("can register a libvirt KVM host", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123"];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DeployForm clearSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    act(() =>
      wrapper.find("Formik").props().onSubmit({
        kernel: "",
        oSystem: "ubuntu",
        release: "bionic",
        vmHostType: PodType.VIRSH,
      })
    );
    const action = store
      .getActions()
      .find((action) => action.type === "machine/deploy");
    expect(action?.payload?.params?.extra?.install_kvm).toBe(true);
    expect(action?.payload?.params?.extra?.register_vmhost).toBeUndefined();
  });
});
