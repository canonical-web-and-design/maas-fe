import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";

import KVMDetailsHeader from "./KVMDetailsHeader";

import { PodType } from "app/store/pod/types";
import type { RootState } from "app/store/root/types";
import {
  pod as podFactory,
  podResources as podResourcesFactory,
  podState as podStateFactory,
  podVmCount as podVmCountFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("KVMDetailsHeader", () => {
  let initialState: RootState;

  beforeEach(() => {
    initialState = rootStateFactory({
      pod: podStateFactory({
        errors: {},
        loading: false,
        loaded: true,
        items: [
          podFactory({
            id: 1,
            name: "pod-1",
            resources: podResourcesFactory({
              vm_count: podVmCountFactory({ tracked: 10 }),
            }),
          }),
        ],
      }),
    });
  });

  it("displays a spinner if pods are loading", () => {
    const state = { ...initialState };
    state.pod.loading = true;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <KVMDetailsHeader
            selectedAction={null}
            setSelectedAction={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Spinner").exists()).toBe(true);
  });

  it("displays pod name and address when loaded", () => {
    const state = { ...initialState };
    state.pod.items = [
      podFactory({ id: 1, name: "pod-name", power_address: "192.168.1.1" }),
    ];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <Route
            exact
            path="/kvm/:id"
            component={() => (
              <KVMDetailsHeader
                selectedAction={null}
                setSelectedAction={jest.fn()}
              />
            )}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find('[data-test="pod-name"]').text()).toBe("pod-name");
    expect(wrapper.find('[data-test="pod-address"]').text()).toBe(
      "192.168.1.1"
    );
  });

  it("can display the tracked VMs count", () => {
    const state = { ...initialState };
    state.pod.items = [
      podFactory({
        id: 1,
        resources: podResourcesFactory({
          vm_count: podVmCountFactory({ tracked: 5 }),
        }),
      }),
    ];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/1/resources", key: "testKey" }]}
        >
          <Route
            exact
            path="/kvm/:id/resources"
            component={() => (
              <KVMDetailsHeader
                selectedAction={null}
                setSelectedAction={jest.fn()}
              />
            )}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("[data-test='section-header-subtitle']").text()).toBe(
      "5 VMs available"
    );
  });

  it("shows a tab for project if the pod is a LXD pod", () => {
    const state = rootStateFactory({
      pod: podStateFactory({
        items: [podFactory({ id: 1, type: PodType.LXD })],
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <Route
            exact
            path="/kvm/:id"
            component={() => (
              <KVMDetailsHeader
                selectedAction={null}
                setSelectedAction={jest.fn()}
              />
            )}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-test='projects-tab']").exists()).toBe(true);
  });

  it("does not show a tab for project if the pod is not a LXD pod", () => {
    const state = rootStateFactory({
      pod: podStateFactory({
        items: [podFactory({ id: 1, type: PodType.VIRSH })],
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <Route
            exact
            path="/kvm/:id"
            component={() => (
              <KVMDetailsHeader
                selectedAction={null}
                setSelectedAction={jest.fn()}
              />
            )}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-test='projects-tab']").exists()).toBe(false);
  });

  it("shows a dropdown action menu if the pod is not a LXD pod", () => {
    const state = rootStateFactory({
      pod: podStateFactory({
        items: [podFactory({ id: 1, type: PodType.VIRSH })],
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <Route
            exact
            path="/kvm/:id"
            component={() => (
              <KVMDetailsHeader
                selectedAction={null}
                setSelectedAction={jest.fn()}
              />
            )}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("PodDetailsActionMenu").exists()).toBe(true);
  });

  it("does not show a dropdown action menu if the pod is a LXD pod", () => {
    const state = rootStateFactory({
      pod: podStateFactory({
        items: [podFactory({ id: 1, type: PodType.LXD })],
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <Route
            exact
            path="/kvm/:id"
            component={() => (
              <KVMDetailsHeader
                selectedAction={null}
                setSelectedAction={jest.fn()}
              />
            )}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("PodDetailsActionMenu").exists()).toBe(false);
  });
});
