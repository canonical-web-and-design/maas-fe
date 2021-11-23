import {
  canOpenActionForm,
  nodeIsController,
  nodeIsDevice,
  nodeIsMachine,
} from "./node";

import { NodeActions, NodeStatus } from "app/store/types/node";
import {
  controller as controllerFactory,
  device as deviceFactory,
  machine as machineFactory,
} from "testing/factories";

describe("node utils", () => {
  describe("nodeIsController", () => {
    it("correctly identifies a node as a controller", () => {
      expect(nodeIsController(controllerFactory())).toBe(true);
      expect(nodeIsController(deviceFactory())).toBe(false);
      expect(nodeIsController(machineFactory())).toBe(false);
      expect(nodeIsController(null)).toBe(false);
      expect(nodeIsController()).toBe(false);
    });
  });

  describe("nodeIsDevice", () => {
    it("correctly identifies a node as a device", () => {
      expect(nodeIsDevice(controllerFactory())).toBe(false);
      expect(nodeIsDevice(deviceFactory())).toBe(true);
      expect(nodeIsDevice(machineFactory())).toBe(false);
      expect(nodeIsDevice(null)).toBe(false);
      expect(nodeIsDevice()).toBe(false);
    });
  });

  describe("nodeIsMachine", () => {
    it("correctly identifies a node as a machine", () => {
      expect(nodeIsMachine(controllerFactory())).toBe(false);
      expect(nodeIsMachine(deviceFactory())).toBe(false);
      expect(nodeIsMachine(machineFactory())).toBe(true);
      expect(nodeIsMachine(null)).toBe(false);
      expect(nodeIsMachine()).toBe(false);
    });
  });

  describe("canOpenActionForm", () => {
    it("handles the null case", () => {
      expect(canOpenActionForm(null, null)).toBe(false);
      expect(canOpenActionForm(machineFactory(), null)).toBe(false);
      expect(canOpenActionForm(null, NodeActions.TAG)).toBe(false);
    });

    it("handles whether a node can open an action form", () => {
      const node = deviceFactory({ actions: [NodeActions.SET_ZONE] });
      expect(canOpenActionForm(node, NodeActions.SET_ZONE)).toBe(true);
      expect(canOpenActionForm(node, NodeActions.DELETE)).toBe(false);
    });

    it("handles whether a machine can open the clone action form", () => {
      const machine1 = machineFactory({
        actions: [NodeActions.CLONE],
        status: NodeStatus.READY,
      });
      const machine2 = machineFactory({
        actions: [],
        status: NodeStatus.READY,
      });
      const machine3 = machineFactory({
        actions: [NodeActions.CLONE],
        status: NodeStatus.NEW,
      });
      const machine4 = machineFactory({
        actions: [],
        status: NodeStatus.NEW,
      });
      expect(canOpenActionForm(machine1, NodeActions.CLONE)).toBe(true);
      expect(canOpenActionForm(machine2, NodeActions.CLONE)).toBe(true);
      expect(canOpenActionForm(machine3, NodeActions.CLONE)).toBe(false);
      expect(canOpenActionForm(machine4, NodeActions.CLONE)).toBe(false);
    });
  });
});
