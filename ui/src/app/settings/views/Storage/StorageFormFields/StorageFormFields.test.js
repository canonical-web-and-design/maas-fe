import { act } from "react-dom/test-utils";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import StorageForm from "../StorageForm";
import {
  configState as configStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("StorageFormFields", () => {
  let initialState;

  beforeEach(() => {
    initialState = rootStateFactory({
      config: configStateFactory({
        loaded: true,
        items: [
          {
            name: "default_storage_layout",
            value: "bcache",
            choices: [
              ["bcache", "Bcache layout"],
              ["blank", "No storage (blank) layout"],
              ["flat", "Flat layout"],
              ["lvm", "LVM layout"],
              ["vmfs6", "VMFS6 layout"],
            ],
          },
          {
            name: "enable_disk_erasing_on_release",
            value: false,
          },
          {
            name: "disk_erase_with_secure_erase",
            value: false,
          },
          {
            name: "disk_erase_with_quick_erase",
            value: false,
          },
        ],
      }),
    });
  });

  it("displays a warning if blank storage layout chosen", async () => {
    const state = { ...initialState };
    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <StorageForm />
      </Provider>
    );
    const select = wrapper.find("select[name='default_storage_layout']");
    await act(async () => {
      select.props().onChange({
        target: { name: "default_storage_layout", value: "blank" },
      });
    });
    wrapper.update();
    expect(wrapper.find(".p-form-validation__message").text()).toBe(
      "Caution: You will not be able to deploy machines with this storage layout. Manual configuration is required."
    );
  });

  it("displays a warning if vmfs6 storage layout chosen", async () => {
    const state = { ...initialState };
    const store = mockStore(state);

    const wrapper = mount(
      <Provider store={store}>
        <StorageForm />
      </Provider>
    );
    const select = wrapper.find("select[name='default_storage_layout']");
    await act(async () => {
      select.props().onChange({
        target: { name: "default_storage_layout", value: "vmfs6" },
      });
    });
    wrapper.update();
    expect(wrapper.find(".p-form-validation__message").text()).toBe(
      "Caution: The VMFS6 storage layout only allows for the deployment of VMware (ESXi)."
    );
  });
});
