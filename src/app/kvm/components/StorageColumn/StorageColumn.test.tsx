import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import StorageColumn from "./StorageColumn";

import {
  pod as podFactory,
  podResource as podResourceFactory,
  podResources as podResourcesFactory,
  podState as podStateFactory,
  rootState as rootStateFactory,
  vmClusterResource as vmClusterResourceFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("StorageColumn", () => {
  it("displays correct storage information for a pod", () => {
    const pod = podFactory({
      id: 1,
      name: "pod-1",
      resources: podResourcesFactory({
        storage: podResourceFactory({
          allocated_other: 30000000000,
          allocated_tracked: 70000000000,
          free: 900000000000,
        }),
      }),
    });
    const state = rootStateFactory({
      pod: podStateFactory({
        items: [pod],
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <StorageColumn
          defaultPoolId={pod.default_storage_pool}
          pools={{}}
          storage={pod.resources.storage}
        />
      </Provider>
    );
    expect(wrapper.find("Meter").find(".p-meter__label").text()).toBe(
      "0.1 of 1TB allocated"
    );
    expect(wrapper.find("Meter").props().max).toBe(1000000000000);
  });

  it("displays correct storage information for a vmcluster", () => {
    const resources = vmClusterResourceFactory({
      allocated_other: 1,
      allocated_tracked: 2,
      free: 3,
    });
    const store = mockStore(rootStateFactory());
    const wrapper = mount(
      <Provider store={store}>
        <StorageColumn pools={{}} storage={resources} />
      </Provider>
    );
    expect(wrapper.find("Meter").find(".p-meter__label").text()).toBe(
      "2 of 6B allocated"
    );
    expect(wrapper.find("Meter").props().max).toBe(6);
  });
});
