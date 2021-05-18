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
} from "testing/factories";

const mockStore = configureStore();

describe("StorageColumn", () => {
  it("displays correct storage information", () => {
    const state = rootStateFactory({
      pod: podStateFactory({
        items: [
          podFactory({
            id: 1,
            name: "pod-1",
            resources: podResourcesFactory({
              storage: podResourceFactory({
                allocated_other: 30000000000,
                allocated_tracked: 70000000000,
                free: 900000000000,
              }),
            }),
          }),
        ],
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <StorageColumn id={1} />
      </Provider>
    );
    expect(wrapper.find("Meter").find(".p-meter__label").text()).toBe(
      "0.1 of 1 TB allocated"
    );
    expect(wrapper.find("Meter").props().max).toBe(1000000000000);
  });
});
