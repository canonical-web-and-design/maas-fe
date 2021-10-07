import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import LXDHostToolbar from "./LXDHostToolbar";

import { KVMHeaderViews } from "app/kvm/constants";
import kvmURLs from "app/kvm/urls";
import { PodType } from "app/store/pod/constants";
import type { RootState } from "app/store/root/types";
import {
  pod as podFactory,
  podState as podStateFactory,
  rootState as rootStateFactory,
  resourcePool as resourcePoolFactory,
  resourcePoolState as resourcePoolStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("LXDHostToolbar", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory({
      pod: podStateFactory({
        items: [
          podFactory({
            id: 1,
            pool: 2,
            type: PodType.LXD,
          }),
        ],
      }),
      resourcepool: resourcePoolStateFactory({
        items: [resourcePoolFactory({ id: 2, name: "swimming" })],
      }),
    });
  });

  it("shows a spinner if pools haven't loaded yet", () => {
    state.resourcepool.items = [];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: kvmURLs.lxd.single.vms({ id: 1 }), key: "testKey" },
          ]}
        >
          <LXDHostToolbar hostId={1} setHeaderContent={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-test='pod-pool'] Spinner").exists()).toBe(true);
  });

  it("can shows the host's pool's name", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: kvmURLs.lxd.single.vms({ id: 1 }), key: "testKey" },
          ]}
        >
          <LXDHostToolbar hostId={1} setHeaderContent={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-test='pod-pool']").text()).toBe("swimming");
  });

  it("can link to a host's settings page if in cluster view", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: kvmURLs.lxd.cluster.vms.host({
                clusterId: 2,
                hostId: 1,
              }),
              key: "testKey",
            },
          ]}
        >
          <LXDHostToolbar
            clusterId={2}
            hostId={1}
            setHeaderContent={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("Button[data-test='settings-link']").prop("to")).toBe(
      kvmURLs.lxd.cluster.host.edit({ clusterId: 2, hostId: 1 })
    );
  });

  it("does not show a link to host's settings page if in single host view", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: kvmURLs.lxd.single.vms({ id: 1 }), key: "testKey" },
          ]}
        >
          <LXDHostToolbar hostId={1} setHeaderContent={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-test='settings-link']").exists()).toBe(false);
  });

  it("shows tags in single host view", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: kvmURLs.lxd.single.vms({ id: 1 }), key: "testKey" },
          ]}
        >
          <LXDHostToolbar hostId={1} setHeaderContent={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-test='pod-tags']").exists()).toBe(true);
  });

  it("does not shows tags in cluster view", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: kvmURLs.lxd.cluster.vms.host({
                clusterId: 2,
                hostId: 1,
              }),
              key: "testKey",
            },
          ]}
        >
          <LXDHostToolbar
            clusterId={2}
            hostId={1}
            setHeaderContent={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-test='pod-tags']").exists()).toBe(false);
  });

  it("can open the compose VM form", () => {
    const setHeaderContent = jest.fn();
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: kvmURLs.lxd.single.vms({ id: 1 }), key: "testKey" },
          ]}
        >
          <LXDHostToolbar hostId={1} setHeaderContent={setHeaderContent} />
        </MemoryRouter>
      </Provider>
    );

    wrapper.find("button[data-test='add-virtual-machine']").simulate("click");

    expect(setHeaderContent).toHaveBeenCalledWith({
      view: KVMHeaderViews.COMPOSE_VM,
    });
  });
});
