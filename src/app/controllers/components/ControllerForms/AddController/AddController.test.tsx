import AddController from "./AddController";

import { ConfigNames } from "@/app/store/config/types";
import type { RootState } from "@/app/store/root/types";
import * as factory from "@/testing/factories";
import {
  userEvent,
  screen,
  within,
  renderWithBrowserRouter,
} from "@/testing/utils";

describe("AddController", () => {
  let state: RootState;

  beforeEach(() => {
    state = factory.rootState({
      config: factory.configState({
        items: [
          { name: ConfigNames.MAAS_URL, value: "http://1.2.3.4/MAAS" },
          { name: ConfigNames.RPC_SHARED_SECRET, value: "veryverysecret" },
        ],
      }),
      general: factory.generalState({
        version: factory.versionState({ data: "3.2.0" }),
      }),
    });
  });

  it("includes the config in the instructions", () => {
    renderWithBrowserRouter(<AddController clearSidePanelContent={vi.fn()} />, {
      state,
    });
    const instructions = screen.getByTestId("register-snippet");
    expect(
      within(instructions).getByText(new RegExp("http://1.2.3.4/MAAS"))
    ).toBeInTheDocument();
    expect(
      within(instructions).getByText(/veryverysecret/)
    ).toBeInTheDocument();
  });

  it("can close the instructions", async () => {
    const clearSidePanelContent = vi.fn();
    renderWithBrowserRouter(
      <AddController clearSidePanelContent={clearSidePanelContent} />,
      {
        state,
      }
    );
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(clearSidePanelContent).toHaveBeenCalled();
  });

  it("uses a fixed version in both snap and packages instructions", async () => {
    renderWithBrowserRouter(<AddController clearSidePanelContent={vi.fn()} />, {
      state,
    });
    expect(
      screen.getByText(/sudo snap install maas --channel=3.2/)
    ).toBeInTheDocument();

    await userEvent.selectOptions(
      screen.getAllByRole("combobox", { name: "version" })[0],
      "v3.2 Packages"
    );
    expect(
      screen.getByText(new RegExp("sudo apt-add-repository ppa:maas/3.2"))
    ).toBeInTheDocument();
  });
});
