import { OwnerColumn } from "./OwnerColumn";

import type { RootState } from "@/app/store/root/types";
import { NodeActions } from "@/app/store/types/node";
import * as factory from "@/testing/factories";
import { renderWithBrowserRouter, screen, userEvent } from "@/testing/utils";

describe("OwnerColumn", () => {
  let state: RootState;
  beforeEach(() => {
    state = factory.rootState({
      general: factory.generalState({
        machineActions: factory.machineActionsState({
          data: [
            factory.machineAction({
              name: NodeActions.ACQUIRE,
              title: "Allocate...",
            }),
            factory.machineAction({
              name: NodeActions.RELEASE,
              title: "Release...",
            }),
          ],
        }),
      }),
      machine: factory.machineState({
        loaded: true,
        items: [
          factory.machine({
            actions: [],
            system_id: "abc123",
            owner: "user1",
            tags: [],
          }),
        ],
      }),
      user: factory.userState({
        items: [
          factory.user({ last_name: "User Full Name", username: "user1" }),
        ],
      }),
    });
  });

  it("displays owner's username", () => {
    renderWithBrowserRouter(
      <OwnerColumn onToggleMenu={vi.fn()} systemId="abc123" />,
      { state, route: "/machines" }
    );

    expect(screen.getByTestId("owner")).toHaveTextContent("user1");
  });

  it("displays owner's username if showFullName is true and user doesn't have a full name", () => {
    state.user.items[0].last_name = "";
    renderWithBrowserRouter(
      <OwnerColumn onToggleMenu={vi.fn()} showFullName systemId="abc123" />,
      { state, route: "/machines" }
    );

    expect(screen.getByTestId("owner")).toHaveTextContent("user1");
  });

  it("can display owner's full name if present", () => {
    renderWithBrowserRouter(
      <OwnerColumn onToggleMenu={vi.fn()} showFullName systemId="abc123" />,
      { state, route: "/machines" }
    );

    expect(screen.getByTestId("owner")).toHaveTextContent("User Full Name");
  });

  it("displays tags", () => {
    state.machine.items[0].tags = [1, 2];
    state.tag.items = [
      factory.tag({ id: 1, name: "minty" }),
      factory.tag({ id: 2, name: "aloof" }),
    ];
    renderWithBrowserRouter(
      <OwnerColumn onToggleMenu={vi.fn()} systemId="abc123" />,
      { state, route: "/machines" }
    );

    expect(screen.getByTestId("tags")).toHaveTextContent("aloof, minty");
  });

  it("can show a menu item to allocate a machine", async () => {
    state.machine.items[0].actions = [NodeActions.ACQUIRE];
    renderWithBrowserRouter(
      <OwnerColumn onToggleMenu={vi.fn()} systemId="abc123" />,
      { state, route: "/machines" }
    );
    // Open the menu so the elements get rendered.
    await userEvent.click(screen.getByRole("button", { name: "Take action:" }));

    expect(
      screen.getByRole("button", { name: "Allocate..." })
    ).toBeInTheDocument();
  });

  it("can show a menu item to release a machine", async () => {
    state.machine.items[0].actions = [NodeActions.RELEASE];
    renderWithBrowserRouter(
      <OwnerColumn onToggleMenu={vi.fn()} systemId="abc123" />,
      { state, route: "/machines" }
    );
    // Open the menu so the elements get rendered.
    await userEvent.click(screen.getByRole("button", { name: "Take action:" }));

    expect(
      screen.getByRole("button", { name: "Release..." })
    ).toBeInTheDocument();
  });

  it("can show a message when there are no menu items", async () => {
    renderWithBrowserRouter(
      <OwnerColumn onToggleMenu={vi.fn()} systemId="abc123" />,
      { state, route: "/machines" }
    );
    // Open the menu so the elements get rendered.
    await userEvent.click(screen.getByRole("button", { name: "Take action:" }));

    expect(screen.getByText("No owner actions available")).toBeInTheDocument();
  });

  it("does not render table menu if onToggleMenu not provided", () => {
    renderWithBrowserRouter(<OwnerColumn systemId="abc123" />, {
      state,
      route: "/machines",
    });
    expect(
      screen.queryByRole("button", { name: "Take action:" })
    ).not.toBeInTheDocument();
  });
});
