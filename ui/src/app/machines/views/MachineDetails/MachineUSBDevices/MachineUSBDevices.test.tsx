import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";

import MachineUSBDevices from "./MachineUSBDevices";

import {
  machineDetails as machineDetailsFactory,
  machineState as machineStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("MachineUSBDevices", () => {
  it("fetches the machine's node devices on load", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            system_id: "abc123",
          }),
        ],
      }),
    });
    const store = mockStore(state);
    mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[
            { pathname: "/machine/abc123/usb-devices", key: "testKey" },
          ]}
        >
          <Route
            exact
            path="/machine/:id/usb-devices"
            component={() => <MachineUSBDevices setHeaderContent={jest.fn()} />}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(
      store
        .getActions()
        .find((action) => action.type === "nodedevice/getByMachineId")
    ).toStrictEqual({
      type: "nodedevice/getByMachineId",
      meta: {
        method: "list",
        model: "nodedevice",
        nocache: true,
      },
      payload: {
        params: {
          system_id: "abc123",
        },
      },
    });
  });
});
