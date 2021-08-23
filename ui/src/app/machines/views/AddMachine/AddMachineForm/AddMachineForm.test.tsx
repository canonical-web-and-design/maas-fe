import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import AddMachineForm from "./AddMachineForm";

import { PowerFieldScope, PowerFieldType } from "app/store/general/types";
import type { RootState } from "app/store/root/types";
import {
  architecturesState as architecturesStateFactory,
  defaultMinHweKernelState as defaultMinHweKernelStateFactory,
  domain as domainFactory,
  domainState as domainStateFactory,
  generalState as generalStateFactory,
  hweKernelsState as hweKernelsStateFactory,
  powerField as powerFieldFactory,
  powerType as powerTypeFactory,
  powerTypesState as powerTypesStateFactory,
  resourcePool as resourcePoolFactory,
  resourcePoolState as resourcePoolStateFactory,
  rootState as rootStateFactory,
  zone as zoneFactory,
  zoneState as zoneStateFactory,
} from "testing/factories";
import { submitFormikForm } from "testing/utils";

const mockStore = configureStore();

describe("AddMachine", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory({
      domain: domainStateFactory({
        items: [domainFactory({ name: "maas" })],
        loaded: true,
      }),
      general: generalStateFactory({
        architectures: architecturesStateFactory({
          data: ["amd64/generic"],
          loaded: true,
        }),
        defaultMinHweKernel: defaultMinHweKernelStateFactory({
          data: "ga-16.04",
          loaded: true,
        }),
        hweKernels: hweKernelsStateFactory({
          data: [
            ["ga-16.04", "xenial (ga-16.04)"],
            ["ga-18.04", "bionic (ga-18.04)"],
          ],
          loaded: true,
        }),
        powerTypes: powerTypesStateFactory({
          data: [
            powerTypeFactory({
              name: "manual",
              description: "Manual",
              fields: [],
            }),
            powerTypeFactory({
              name: "dummy",
              description: "Dummy power type",
              fields: [
                powerFieldFactory({
                  name: "power_address",
                  label: "IP address",
                  required: true,
                  field_type: PowerFieldType.STRING,
                  choices: [],
                  default: "",
                  scope: PowerFieldScope.BMC,
                }),
              ],
            }),
          ],
          loaded: true,
        }),
      }),
      resourcepool: resourcePoolStateFactory({
        items: [resourcePoolFactory({ name: "default" })],
        loaded: true,
      }),
      zone: zoneStateFactory({
        items: [
          zoneFactory({
            name: "default",
          }),
        ],
        loaded: true,
      }),
    });
  });

  it("fetches the necessary data on load if not already loaded", () => {
    state.resourcepool.loaded = false;
    const store = mockStore(state);
    mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines/add", key: "testKey" }]}
        >
          <AddMachineForm />
        </MemoryRouter>
      </Provider>
    );
    const expectedActions = [
      "FETCH_DOMAIN",
      "general/fetchArchitectures",
      "general/fetchDefaultMinHweKernel",
      "general/fetchHweKernels",
      "general/fetchPowerTypes",
      "resourcepool/fetch",
      "zone/fetch",
    ];
    const actions = store.getActions();
    expectedActions.forEach((expectedAction) => {
      expect(actions.some((action) => action.type === expectedAction));
    });
  });

  it("displays a spinner if data has not loaded", () => {
    state.resourcepool.loaded = false;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines/add", key: "testKey" }]}
        >
          <AddMachineForm />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Spinner").length).toBe(1);
  });

  it("can handle saving a machine", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines/add", key: "testKey" }]}
        >
          <AddMachineForm />
        </MemoryRouter>
      </Provider>
    );

    submitFormikForm(wrapper, {
      architecture: "amd64/generic",
      domain: "maas",
      extra_macs: [],
      hostname: "machine",
      min_hwe_kernel: "ga-16.04",
      pool: "default",
      power_parameters: {},
      power_type: "manual",
      pxe_mac: "11:11:11:11:11:11",
      zone: "default",
    });
    expect(
      store.getActions().find((action) => action.type === "machine/create")
    ).toStrictEqual({
      type: "machine/create",
      meta: {
        method: "create",
        model: "machine",
      },
      payload: {
        params: {
          architecture: "amd64/generic",
          domain: state.domain.items[0],
          extra_macs: [],
          hostname: "machine",
          min_hwe_kernel: "ga-16.04",
          pool: state.resourcepool.items[0],
          power_parameters: {},
          power_type: "manual",
          pxe_mac: "11:11:11:11:11:11",
          zone: state.zone.items[0],
        },
      },
    });
  });

  it("correctly trims power parameters before dispatching action", async () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines/add", key: "testKey" }]}
        >
          <AddMachineForm />
        </MemoryRouter>
      </Provider>
    );

    const powerTypes = wrapper.find("select[name='power_type']");

    // Select the dummy power type from the dropdown, which only has one param.
    await act(async () => {
      powerTypes.simulate("change", {
        target: { name: "power_type", value: "dummy" },
      });
    });
    wrapper.update();

    // Submit the form with an extra power parameter, power_id.
    await act(async () =>
      submitFormikForm(wrapper, {
        architecture: "amd64/generic",
        domain: "maas",
        extra_macs: [],
        hostname: "machine",
        min_hwe_kernel: "ga-16.04",
        pool: "default",
        power_parameters: { power_address: "192.168.1.1", power_id: "1" },
        power_type: "dummy",
        pxe_mac: "11:11:11:11:11:11",
        zone: "default",
      })
    );

    // Expect the power_id param to be removed when action is dispatched.
    expect(
      store.getActions().find((action) => action.type === "machine/create")
    ).toStrictEqual({
      type: "machine/create",
      meta: {
        method: "create",
        model: "machine",
      },
      payload: {
        params: {
          architecture: "amd64/generic",
          domain: state.domain.items[0],
          extra_macs: [],
          hostname: "machine",
          min_hwe_kernel: "ga-16.04",
          pool: state.resourcepool.items[0],
          power_parameters: { power_address: "192.168.1.1" },
          power_type: "dummy",
          pxe_mac: "11:11:11:11:11:11",
          zone: state.zone.items[0],
        },
      },
    });
  });

  it("correctly filters empty extra mac fields", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines/add", key: "testKey" }]}
        >
          <AddMachineForm />
        </MemoryRouter>
      </Provider>
    );

    // Submit the form with two extra macs, where one is an empty string
    submitFormikForm(wrapper, {
      architecture: "amd64/generic",
      domain: "maas",
      extra_macs: ["12:12:12:12:12:12", ""],
      hostname: "machine",
      min_hwe_kernel: "ga-16.04",
      pool: "default",
      power_parameters: {},
      power_type: "dummy",
      pxe_mac: "11:11:11:11:11:11",
      zone: "default",
    });

    // Expect the empty extra mac to be filtered out
    expect(
      store.getActions().find((action) => action.type === "machine/create")
    ).toStrictEqual({
      type: "machine/create",
      meta: {
        method: "create",
        model: "machine",
      },
      payload: {
        params: {
          architecture: "amd64/generic",
          domain: state.domain.items[0],
          extra_macs: ["12:12:12:12:12:12"],
          hostname: "machine",
          min_hwe_kernel: "ga-16.04",
          pool: state.resourcepool.items[0],
          power_parameters: {},
          power_type: "dummy",
          pxe_mac: "11:11:11:11:11:11",
          zone: state.zone.items[0],
        },
      },
    });
  });
});
