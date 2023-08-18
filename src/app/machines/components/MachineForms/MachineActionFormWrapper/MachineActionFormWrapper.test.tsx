import reduxToolkit from "@reduxjs/toolkit";
import configureStore from "redux-mock-store";

import MachineActionFormWrapper from "./MachineActionFormWrapper";

import { actions as machineActions } from "app/store/machine";
import type { RootState } from "app/store/root/types";
import { NodeActions } from "app/store/types/node";
import {
  machineActionState as machineActionStateFactory,
  machine as machineFactory,
  machineState as machineStateFactory,
  rootState as rootStateFactory,
  tagState as tagStateFactory,
} from "testing/factories";
import { mockFormikFormSaved } from "testing/mockFormikFormSaved";
import { screen, renderWithBrowserRouter } from "testing/utils";

const mockStore = configureStore<RootState>();

let html: HTMLHtmlElement | null;
const originalScrollTo = global.scrollTo;

beforeEach(() => {
  jest.spyOn(reduxToolkit, "nanoid").mockReturnValue("123456");
  global.innerHeight = 500;
  // eslint-disable-next-line testing-library/no-node-access
  html = document.querySelector("html");
  global.scrollTo = jest.fn();
});

afterEach(() => {
  if (html) {
    html.scrollTop = 0;
  }
  jest.restoreAllMocks();
});

afterAll(() => {
  global.scrollTo = originalScrollTo;
});

it("scrolls to the top of the window when opening the form", async () => {
  if (html) {
    // Move the page down so that the hook will fire.
    html.scrollTop = 10;
  }
  renderWithBrowserRouter(
    <MachineActionFormWrapper
      action={NodeActions.ABORT}
      clearSidePanelContent={jest.fn()}
      selectedMachines={{}}
      viewingDetails={false}
    />
  );
  expect(global.scrollTo).toHaveBeenCalled();
});

it("can show untag errors when the tag form is open", async () => {
  const state = rootStateFactory({
    machine: machineStateFactory({
      actions: {
        "123456": machineActionStateFactory({
          status: "error",
          errors: "Untagging failed",
        }),
      },
    }),
    tag: tagStateFactory({
      loaded: true,
    }),
  });
  const machines = [
    machineFactory({
      system_id: "abc123",
      actions: [NodeActions.TAG, NodeActions.UNTAG],
    }),
  ];
  renderWithBrowserRouter(
    <MachineActionFormWrapper
      action={NodeActions.TAG}
      clearSidePanelContent={jest.fn()}
      selectedMachines={{ items: [machines[0].system_id] }}
      viewingDetails={false}
    />,
    { state }
  );
  expect(screen.getByText("Untagging failed")).toBeInTheDocument();
});

it("clears selected machines and invalidates queries on delete success", async () => {
  mockFormikFormSaved();
  const state = rootStateFactory();
  const machines = [
    machineFactory({
      system_id: "abc123",
    }),
  ];
  const store = mockStore(state);
  renderWithBrowserRouter(
    <MachineActionFormWrapper
      action={NodeActions.DELETE}
      clearSidePanelContent={jest.fn()}
      selectedMachines={{ items: [machines[0].system_id] }}
      viewingDetails={false}
    />,
    { store }
  );
  expect(
    store.getActions().find((action) => action.type === "machine/setSelected")
      .payload
  ).toEqual(null);
  expect(
    store
      .getActions()
      .filter(
        (action) => action.type === machineActions.invalidateQueries().type
      )
  ).toHaveLength(1);
});

it("displays a warning message and disabled submit button when selectedCount equals 0", () => {
  renderWithBrowserRouter(
    <MachineActionFormWrapper
      action={NodeActions.DELETE}
      clearSidePanelContent={jest.fn()}
      selectedCount={0}
      selectedMachines={{ filter: {} }}
      viewingDetails={false}
    />
  );
  expect(
    screen.getByText(/No machines have been selected./)
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Delete machine" })).toBeDisabled();
});

it("displays an error message with failure details", async () => {
  const machines = [
    machineFactory({
      system_id: "abc123",
      hostname: "test-machine-1",
      actions: [],
    }),
  ];
  const failedSystemIds = ["abc123"];
  const failureDetails = {
    "mark broken action is not available for this node": ["abc123"],
  };
  const state = rootStateFactory({
    machine: machineStateFactory({
      actions: {
        "123456": machineActionStateFactory({
          status: "error",
          failedSystemIds,
          failureDetails,
        }),
      },
      items: [...machines],
    }),
  });
  renderWithBrowserRouter(
    <MachineActionFormWrapper
      action={NodeActions.MARK_BROKEN}
      clearSidePanelContent={jest.fn()}
      selectedCountLoading={false}
      selectedMachines={{ items: [machines[0].system_id] }}
      viewingDetails={false}
    />,
    { state }
  );
  expect(screen.getByText(/failed for 1 machine/)).toBeInTheDocument();
  expect(
    screen.getByText(/mark broken action is not available for this node/)
  ).toBeInTheDocument();
});
