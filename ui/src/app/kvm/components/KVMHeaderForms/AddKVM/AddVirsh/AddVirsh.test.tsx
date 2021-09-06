import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import AddVirsh from "./AddVirsh";

import { PodType } from "app/store/pod/types";
import type { RootState } from "app/store/root/types";
import {
  configState as configStateFactory,
  generalState as generalStateFactory,
  powerField as powerFieldFactory,
  powerTypesState as powerTypesStateFactory,
  powerType as powerTypeFactory,
  podState as podStateFactory,
  resourcePool as resourcePoolFactory,
  resourcePoolState as resourcePoolStateFactory,
  rootState as rootStateFactory,
  zone as zoneFactory,
  zoneState as zoneStateFactory,
} from "testing/factories";
import { submitFormikForm } from "testing/utils";

const mockStore = configureStore();

describe("AddVirsh", () => {
  let initialState: RootState;

  beforeEach(() => {
    initialState = rootStateFactory({
      config: configStateFactory({
        items: [{ name: "maas_name", value: "MAAS" }],
      }),
      general: generalStateFactory({
        powerTypes: powerTypesStateFactory({
          data: [
            powerTypeFactory({
              name: PodType.VIRSH,
              fields: [
                powerFieldFactory({ name: "power_address" }),
                powerFieldFactory({ name: "power_pass" }),
              ],
            }),
          ],
          loaded: true,
        }),
      }),
      pod: podStateFactory({
        loaded: true,
      }),
      resourcepool: resourcePoolStateFactory({
        items: [resourcePoolFactory()],
        loaded: true,
      }),
      zone: zoneStateFactory({
        items: [zoneFactory()],
        loaded: true,
      }),
    });
  });

  it("displays a spinner if virsh power type not in state", () => {
    const state = { ...initialState };
    state.general.powerTypes.data = [];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/add", key: "testKey" }]}
        >
          <AddVirsh clearHeaderContent={jest.fn()} setKvmType={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Spinner").length).toBe(1);
  });

  it("can handle saving a virsh KVM", () => {
    const state = { ...initialState };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/add", key: "testKey" }]}
        >
          <AddVirsh clearHeaderContent={jest.fn()} setKvmType={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      submitFormikForm(wrapper, {
        name: "my-favourite-kvm",
        pool: 0,
        // power_parameters should be flattened before being sent through the websocket
        power_parameters: {
          power_address: "192.68.1.1",
          power_pass: "password",
        },
        type: "virsh",
        zone: 0,
      })
    );

    expect(
      store.getActions().find((action) => action.type === "pod/create")
    ).toStrictEqual({
      type: "pod/create",
      meta: {
        method: "create",
        model: "pod",
      },
      payload: {
        params: {
          name: "my-favourite-kvm",
          pool: 0,
          power_address: "192.68.1.1",
          power_pass: "password",
          type: "virsh",
          zone: 0,
        },
      },
    });
  });
});
