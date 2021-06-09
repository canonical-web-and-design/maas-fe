import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";

import KVMConfiguration from "../KVMConfiguration";

import { PodType } from "app/store/pod/types";
import type { RootState } from "app/store/root/types";
import {
  pod as podFactory,
  podState as podStateFactory,
  resourcePoolState as resourcePoolStateFactory,
  rootState as rootStateFactory,
  tagState as tagStateFactory,
  zoneState as zoneStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("KVMConfigurationFields", () => {
  let initialState: RootState;

  beforeEach(() => {
    initialState = rootStateFactory({
      pod: podStateFactory({ items: [], loaded: true }),
      resourcepool: resourcePoolStateFactory({
        loaded: true,
      }),
      tag: tagStateFactory({
        loaded: true,
      }),
      zone: zoneStateFactory({
        loaded: true,
      }),
    });
  });

  it("correctly sets initial values for virsh pods", () => {
    const state = { ...initialState };
    const pod = podFactory({
      id: 1,
      type: PodType.VIRSH,
      power_pass: "maxpower",
    });
    state.pod.items = [pod];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/1/edit", key: "testKey" }]}
        >
          <Route
            exact
            path="/kvm/:id/edit"
            component={() => (
              <KVMConfiguration id={1} setSelectedAction={jest.fn()} />
            )}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Input[name='type']").props().value).toBe("Virsh");
    expect(wrapper.find("Select[name='zone']").props().value).toEqual(pod.zone);
    expect(wrapper.find("Select[name='pool']").props().value).toEqual(pod.pool);
    expect(wrapper.find("TagSelector[name='tags']").props().value).toEqual(
      pod.tags
    );
    expect(wrapper.find("Input[name='power_address']").props().value).toBe(
      pod.power_address
    );
    expect(wrapper.find("Input[name='password']").props().value).toBe(
      pod.power_pass
    );
    expect(
      wrapper.find("Slider[name='cpu_over_commit_ratio']").props().value
    ).toBe(pod.cpu_over_commit_ratio);
    expect(
      wrapper.find("Slider[name='memory_over_commit_ratio']").props().value
    ).toBe(pod.memory_over_commit_ratio);
  });

  it("correctly sets initial values for lxd pods", () => {
    const state = { ...initialState };
    const pod = podFactory({
      id: 1,
      type: PodType.LXD,
      password: "powerranger",
    });
    state.pod.items = [pod];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/1/edit", key: "testKey" }]}
        >
          <Route
            exact
            path="/kvm/:id/edit"
            component={() => (
              <KVMConfiguration id={1} setSelectedAction={jest.fn()} />
            )}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Input[name='type']").props().value).toBe("LXD");
    expect(wrapper.find("Select[name='zone']").props().value).toEqual(pod.zone);
    expect(wrapper.find("Select[name='pool']").props().value).toEqual(pod.pool);
    expect(wrapper.find("TagSelector[name='tags']").props().value).toEqual(
      pod.tags
    );
    expect(wrapper.find("Input[name='power_address']").props().value).toBe(
      pod.power_address
    );
    expect(wrapper.find("Input[name='password']").props().value).toBe(
      pod.password
    );
    expect(
      wrapper.find("Slider[name='cpu_over_commit_ratio']").props().value
    ).toBe(pod.cpu_over_commit_ratio);
    expect(
      wrapper.find("Slider[name='memory_over_commit_ratio']").props().value
    ).toBe(pod.memory_over_commit_ratio);
  });
});
