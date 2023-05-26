import WorkloadCard from "./WorkloadCard";

import {
  machineDetails as machineDetailsFactory,
  machineState as machineStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";
import { renderWithBrowserRouter, screen, within } from "testing/utils";

describe("WorkloadCard", () => {
  it("displays a message if the machine has no workload annotations", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            system_id: "abc123",
            workload_annotations: {},
          }),
        ],
      }),
    });
    renderWithBrowserRouter(<WorkloadCard id="abc123" />, {
      route: "/machine/abc123",
      state,
    });
    expect(screen.getByTestId("no-workload-annotations")).toBeInTheDocument();
  });

  it("can display a list of workload annotations", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            system_id: "abc123",
            workload_annotations: {
              key1: "value1",
              key2: "value2",
            },
          }),
        ],
      }),
    });
    renderWithBrowserRouter(<WorkloadCard id="abc123" />, {
      route: "/machine/abc123",
      state,
    });

    expect(
      within(screen.getByTestId("workload-annotations")).getAllByRole(
        "listitem"
      )
    ).toHaveLength(2);
    expect(screen.getAllByTestId("workload-key")[0]).toHaveTextContent("key1");
    expect(screen.getAllByTestId("workload-value")[0]).toHaveTextContent(
      "value1"
    );
  });

  it("displays comma-separated values on new lines", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            system_id: "abc123",
            workload_annotations: {
              separated: "comma,separated,value",
            },
          }),
        ],
      }),
    });
    renderWithBrowserRouter(<WorkloadCard id="abc123" />, {
      route: "/machine/abc123",
      state,
    });

    const workloadValues = within(
      screen.getByTestId("workload-value")
    ).getAllByRole("link");

    expect(workloadValues[0]).toHaveTextContent("comma");
    expect(workloadValues[1]).toHaveTextContent("separated");
    expect(workloadValues[2]).toHaveTextContent("value");
  });

  it("displays links to filter machine list by workload annotation", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            system_id: "abc123",
            workload_annotations: {
              key: "value",
            },
          }),
        ],
      }),
    });
    renderWithBrowserRouter(<WorkloadCard id="abc123" />, {
      route: "/machine/abc123",
      state,
    });

    expect(screen.getByRole("link", { name: "value" })).toHaveAttribute(
      "href",
      "/machines?workload-key=value"
    );
  });
});
