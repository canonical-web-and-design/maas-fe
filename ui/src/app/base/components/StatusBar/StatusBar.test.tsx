import { screen } from "@testing-library/react";

import StatusBar from "./StatusBar";

import type { RootState } from "app/store/root/types";
import { NodeStatus } from "app/store/types/node";
import {
  machineDetails as machineDetailsFactory,
  config as configFactory,
  configState as configStateFactory,
  generalState as generalStateFactory,
  machineState as machineStateFactory,
  rootState as rootStateFactory,
  versionState as versionStateFactory,
} from "testing/factories";
import { renderWithMockStore } from "testing/utils";

describe("StatusBar", () => {
  let state: RootState;
  beforeEach(() => {
    jest.useFakeTimers("modern");
    // Thu, 31 Dec. 2020 23:00:00 UTC
    jest.setSystemTime(new Date(Date.UTC(2020, 11, 31, 23, 0, 0)));
    state = rootStateFactory({
      config: configStateFactory({
        items: [configFactory({ name: "maas_name", value: "bolla" })],
      }),
      general: generalStateFactory({
        version: versionStateFactory({ data: "2.10.0" }),
      }),
      machine: machineStateFactory({
        active: "abc123",
        items: [],
      }),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("active machine status", () => {
    it("can show if a machine is currently commissioning", () => {
      state.machine.items = [
        machineDetailsFactory({
          fqdn: "test.maas",
          status: NodeStatus.COMMISSIONING,
          system_id: "abc123",
        }),
      ];

      renderWithMockStore(<StatusBar />, { state });

      expect(screen.getByTestId("status-bar-status")).toHaveTextContent(
        "test.maas: Commissioning in progress..."
      );
    });

    it("can show if a machine has not been commissioned yet", () => {
      state.machine.items = [
        machineDetailsFactory({
          commissioning_start_time: "",
          fqdn: "test.maas",
          system_id: "abc123",
        }),
      ];

      renderWithMockStore(<StatusBar />, { state });

      expect(screen.getByTestId("status-bar-status")).toHaveTextContent(
        "test.maas: Not yet commissioned"
      );
    });

    it("can show the last time a machine was commissioned", () => {
      state.machine.items = [
        machineDetailsFactory({
          commissioning_start_time: "Thu, 31 Dec. 2020 22:59:00",
          fqdn: "test.maas",
          status: NodeStatus.DEPLOYED,
          system_id: "abc123",
        }),
      ];

      renderWithMockStore(<StatusBar />, { state });

      expect(screen.getByTestId("status-bar-status")).toHaveTextContent(
        "test.maas: Last commissioned 1 minute ago"
      );
    });

    it("can handle an incorrectly formatted commissioning timestamp", () => {
      state.machine.items = [
        machineDetailsFactory({
          commissioning_start_time: "2020-03-01 09:12:43",
          fqdn: "test.maas",
          status: NodeStatus.DEPLOYED,
          system_id: "abc123",
        }),
      ];

      renderWithMockStore(<StatusBar />, { state });

      expect(screen.getByTestId("status-bar-status")).toHaveTextContent(
        "test.maas: Unable to parse commissioning timestamp (Invalid time value)"
      );
    });
  });
});
