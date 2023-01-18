import ControllerHeaderForms from "./ControllerHeaderForms";

import { ControllerHeaderViews } from "app/controllers/constants";
import {
  controller as controllerFactory,
  rootState as rootStateFactory,
} from "testing/factories";
import { screen, renderWithBrowserRouter } from "testing/utils";

describe("ControllerHeaderForms", () => {
  it("can render a warning if an action cannot be taken", () => {
    const state = rootStateFactory();
    renderWithBrowserRouter(
      <ControllerHeaderForms
        controllers={[controllerFactory()]}
        setSidePanelContent={jest.fn()}
        sidePanelContent={{ view: ControllerHeaderViews.SET_ZONE_CONTROLLER }}
      />,
      { state }
    );

    expect(
      screen.getByText(/Cannot set zone of 1 controller/)
    ).toBeInTheDocument();
  });

  it("can render add controller instructions", () => {
    const state = rootStateFactory();
    renderWithBrowserRouter(
      <ControllerHeaderForms
        controllers={[controllerFactory()]}
        setSidePanelContent={jest.fn()}
        sidePanelContent={{ view: ControllerHeaderViews.ADD_CONTROLLER }}
      />,
      { state }
    );

    expect(
      screen.getByText(
        /To add a new rack controller, SSH into the rack controller and run the commands below. Confirm that the MAAS version is the same as the main rack controller./
      )
    ).toBeInTheDocument();
  });
});
