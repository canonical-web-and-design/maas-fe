import { DomainListSidePanelViews } from "../constants";

import DomainListHeader, {
  Labels as DomainListHeaderLabels,
} from "./DomainListHeader";

import type { RootState } from "@/app/store/root/types";
import * as factory from "@/testing/factories";
import { userEvent, screen, renderWithBrowserRouter } from "@/testing/utils";

describe("DomainListHeader", () => {
  let initialState: RootState;

  beforeEach(() => {
    initialState = factory.rootState({
      domain: factory.domainState({
        loaded: true,
        items: [factory.domain(), factory.domain()],
      }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("displays a loader if domains have not loaded", () => {
    const state = { ...initialState };
    state.domain.loaded = false;

    renderWithBrowserRouter(
      <DomainListHeader setSidePanelContent={vi.fn()} />,
      {
        route: "/domains",
        state,
      }
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays a domain count if domains have loaded", () => {
    const state = { ...initialState };
    state.domain.loaded = true;
    renderWithBrowserRouter(
      <DomainListHeader setSidePanelContent={vi.fn()} />,
      {
        route: "/domains",
        state,
      }
    );

    expect(screen.getByText("2 domains available")).toBeInTheDocument();
  });

  it("displays the form when Add domains is clicked", async () => {
    const state = { ...initialState };
    const setSidePanelContent = vi.fn();
    renderWithBrowserRouter(
      <DomainListHeader setSidePanelContent={setSidePanelContent} />,
      {
        route: "/domains",
        state,
      }
    );

    await userEvent.click(
      screen.getByRole("button", { name: DomainListHeaderLabels.AddDomains })
    );

    expect(setSidePanelContent).toHaveBeenCalledWith({
      view: DomainListSidePanelViews.ADD_DOMAIN,
    });
  });
});
