import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";

import KVMConfiguration from "./KVMConfiguration";

import { PodAction, PodType } from "app/store/pod/types";
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

describe("KVMConfiguration", () => {
  let initialState: RootState;

  beforeEach(() => {
    initialState = rootStateFactory({
      pod: podStateFactory({
        items: [podFactory({ id: 1, name: "pod1" })],
        loaded: true,
      }),
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

  it("fetches the necessary data on load", () => {
    const state = { ...initialState };
    const store = mockStore(state);
    mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/1/edit", key: "testKey" }]}
        >
          <KVMConfiguration id={1} setSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    const expectedActions = [
      "pod/fetch",
      "resourcepool/fetch",
      "tag/fetch",
      "zone/fetch",
    ];
    const actions = store.getActions();
    expectedActions.forEach((expectedAction) => {
      expect(actions.some((action) => action.type === expectedAction));
    });
  });

  it("displays a spinner if data has not loaded", () => {
    const state = { ...initialState };
    state.resourcepool.loaded = false;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/1/edit", key: "testKey" }]}
        >
          <KVMConfiguration id={1} setSelectedAction={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Spinner").length).toBe(1);
  });

  it("can open the delete form if the KVM is a LXD KVM", () => {
    const state = { ...initialState };
    state.pod.items[0].type = PodType.LXD;
    const setSelectedAction = jest.fn();
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/kvm/1/edit", key: "testKey" }]}
        >
          <KVMConfiguration id={1} setSelectedAction={setSelectedAction} />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find("button[data-test='remove-kvm']").simulate("click");
    expect(setSelectedAction).toHaveBeenCalledWith(PodAction.DELETE);
  });

  it("can handle updating a lxd KVM", () => {
    const state = { ...initialState };
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

    act(() =>
      wrapper
        .find("Formik")
        .props()
        .onSubmit({
          cpu_over_commit_ratio: 2,
          memory_over_commit_ratio: 2,
          password: "password",
          pool: "1",
          power_address: "192.168.1.1",
          tags: ["tag1", "tag2"],
          type: "lxd",
          zone: "2",
        })
    );
    expect(
      store.getActions().find((action) => action.type === "pod/update")
    ).toStrictEqual({
      type: "pod/update",
      meta: {
        method: "update",
        model: "pod",
      },
      payload: {
        params: {
          cpu_over_commit_ratio: 2,
          id: 1,
          memory_over_commit_ratio: 2,
          password: "password", // lxd uses password key
          pool: 1,
          power_address: "192.168.1.1",
          power_pass: undefined,
          tags: "tag1,tag2",
          zone: 2,
        },
      },
    });
  });

  it("can handle updating a virsh KVM", () => {
    const state = { ...initialState };
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

    act(() =>
      wrapper
        .find("Formik")
        .props()
        .onSubmit({
          cpu_over_commit_ratio: 2,
          memory_over_commit_ratio: 2,
          password: "password",
          pool: "1",
          power_address: "192.168.1.1",
          tags: ["tag1", "tag2"],
          type: "virsh",
          zone: "2",
        })
    );
    expect(
      store.getActions().find((action) => action.type === "pod/update")
    ).toStrictEqual({
      type: "pod/update",
      meta: {
        method: "update",
        model: "pod",
      },
      payload: {
        params: {
          cpu_over_commit_ratio: 2,
          id: 1,
          memory_over_commit_ratio: 2,
          password: undefined,
          pool: 1,
          power_address: "192.168.1.1",
          power_pass: "password", // virsh uses power_pass key
          tags: "tag1,tag2",
          zone: 2,
        },
      },
    });
  });
});
