import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import DeviceLink, { Labels } from "./DeviceLink";

import urls from "@/app/base/urls";
import * as factory from "@/testing/factories";
import { render, screen } from "@/testing/utils";

const mockStore = configureStore();

it("handles when devices are loading", () => {
  const state = factory.rootState({
    device: factory.deviceState({ items: [], loading: true }),
  });
  const store = mockStore(state);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <CompatRouter>
          <DeviceLink systemId="abc123" />
        </CompatRouter>
      </MemoryRouter>
    </Provider>
  );

  expect(screen.getByLabelText(Labels.LoadingDevices)).toBeInTheDocument();
});

it("handles when a device does not exist", () => {
  const state = factory.rootState({
    device: factory.deviceState({ items: [], loading: false }),
  });
  const store = mockStore(state);
  const { container } = render(
    <Provider store={store}>
      <MemoryRouter>
        <CompatRouter>
          <DeviceLink systemId="abc123" />
        </CompatRouter>
      </MemoryRouter>
    </Provider>
  );

  expect(container).toBeEmptyDOMElement();
});

it("renders a link if devices have loaded and it exists", () => {
  const device = factory.device();
  const state = factory.rootState({
    device: factory.deviceState({ items: [device], loading: false }),
  });
  const store = mockStore(state);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <CompatRouter>
          <DeviceLink systemId={device.system_id} />
        </CompatRouter>
      </MemoryRouter>
    </Provider>
  );

  expect(screen.getByRole("link")).toHaveAttribute(
    "href",
    urls.devices.device.index({ id: device.system_id })
  );
});
