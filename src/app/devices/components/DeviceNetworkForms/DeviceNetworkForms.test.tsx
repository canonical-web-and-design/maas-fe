import configureStore from "redux-mock-store";

import DeviceNetworkForms from "./DeviceNetworkForms";

import { DeviceSidePanelViews } from "@/app/devices/constants";
import type { DeviceSidePanelContent } from "@/app/devices/types";
import type { RootState } from "@/app/store/root/types";
import * as factory from "@/testing/factories";
import { renderWithBrowserRouter, screen } from "@/testing/utils";

const mockStore = configureStore<RootState>();
let state: RootState;

beforeEach(() => {
  state = factory.rootState({
    device: factory.deviceState({
      items: [factory.deviceDetails({ system_id: "abc123" })],
    }),
  });
});

it("renders a form when appropriate sidepanel view is provided", () => {
  const store = mockStore(state);
  const sidePanelContent: DeviceSidePanelContent = {
    view: DeviceSidePanelViews.ADD_INTERFACE,
  };
  renderWithBrowserRouter(
    <DeviceNetworkForms
      setSidePanelContent={vi.fn()}
      sidePanelContent={sidePanelContent}
      systemId="abc123"
    />,
    { store }
  );

  expect(
    screen.getByRole("form", { name: /add interface/i })
  ).toBeInTheDocument();
});
