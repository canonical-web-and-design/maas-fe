import machine from "./selectors";

import { NetworkInterfaceTypes } from "app/store/types/enum";
import { NodeActions, NodeStatusCode } from "app/store/types/node";
import {
  machine as machineFactory,
  machineDetails as machineDetailsFactory,
  machineInterface as machineInterfaceFactory,
  networkLink as networkLinkFactory,
  machineEventError as machineEventErrorFactory,
  machineState as machineStateFactory,
  machineStatus as machineStatusFactory,
  machineStatuses as machineStatusesFactory,
  rootState as rootStateFactory,
} from "testing/factories";

describe("machine selectors", () => {
  it("can get all items", () => {
    const items = [machineFactory(), machineFactory()];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
      }),
    });
    expect(machine.all(state)).toEqual(items);
  });

  it("can get the loading state", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        loading: true,
      }),
    });
    expect(machine.loading(state)).toEqual(true);
  });

  it("can get the loaded state", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        loaded: true,
      }),
    });
    expect(machine.loaded(state)).toEqual(true);
  });

  it("can get the saving state", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        saving: true,
      }),
    });
    expect(machine.saving(state)).toEqual(true);
  });

  it("can get the saved state", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        saved: true,
      }),
    });
    expect(machine.saved(state)).toEqual(true);
  });

  it("can get the active machine's system ID", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        active: "abc123",
      }),
    });
    expect(machine.activeID(state)).toEqual("abc123");
  });

  it("can get the active machine", () => {
    const activeMachine = machineFactory();
    const state = rootStateFactory({
      machine: machineStateFactory({
        active: activeMachine.system_id,
        items: [activeMachine],
      }),
    });
    expect(machine.active(state)).toEqual(activeMachine);
  });

  it("can get the errors state", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        errors: "Data is incorrect",
      }),
    });
    expect(machine.errors(state)).toStrictEqual("Data is incorrect");
  });

  it("can get a machine by id", () => {
    const items = [
      machineFactory({ system_id: "808" }),
      machineFactory({ system_id: "909" }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
      }),
    });
    expect(machine.getById(state, "909")).toStrictEqual(items[1]);
  });

  it("can get machines by status code", () => {
    const items = [
      machineFactory({ status_code: NodeStatusCode.DISK_ERASING }),
      machineFactory({ status_code: NodeStatusCode.BROKEN }),
      machineFactory({ status_code: NodeStatusCode.DISK_ERASING }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
      }),
    });
    expect(
      machine.getByStatusCode(state, NodeStatusCode.DISK_ERASING)
    ).toStrictEqual([items[0], items[2]]);
  });

  it("can get the machine statuses", () => {
    const statuses = machineStatusesFactory();
    const state = rootStateFactory({
      machine: machineStateFactory({
        statuses,
      }),
    });
    expect(machine.statuses(state)).toStrictEqual(statuses);
  });

  it("can get the statuses for a machine", () => {
    const machineStatuses = machineStatusFactory();
    const state = rootStateFactory({
      machine: machineStateFactory({
        statuses: machineStatusesFactory({
          abc123: machineStatuses,
        }),
      }),
    });
    expect(machine.getStatuses(state, "abc123")).toStrictEqual(machineStatuses);
  });

  it("can get a status for a machine", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [machineFactory({ system_id: "abc123" })],
        statuses: machineStatusesFactory({
          abc123: machineStatusFactory({ creatingPhysical: true }),
        }),
      }),
    });
    expect(
      machine.getStatusForMachine(state, "abc123", "creatingPhysical")
    ).toBe(true);
  });

  it("can get machines that are processing", () => {
    const statuses = machineStatusesFactory({
      abc123: machineStatusFactory({ testing: true }),
      def456: machineStatusFactory(),
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        statuses,
      }),
    });
    expect(machine.processing(state)).toStrictEqual(["abc123"]);
  });

  it("can get selected machines that are processing", () => {
    const statuses = machineStatusesFactory({
      abc123: machineStatusFactory({ testing: true }),
      def456: machineStatusFactory({ testing: true }),
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        selected: ["abc123"],
        statuses,
      }),
    });
    expect(machine.selectedProcessing(state)).toStrictEqual(["abc123"]);
  });

  it("can get machines that are saving pools", () => {
    const items = [
      machineFactory({ system_id: "808" }),
      machineFactory({ system_id: "909" }),
    ];
    const statuses = machineStatusesFactory({
      "808": machineStatusFactory(),
      "909": machineStatusFactory({ settingPool: true }),
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
        statuses,
      }),
    });
    expect(machine.settingPool(state)).toStrictEqual([items[1]]);
  });

  it("can get machines that are both selected and saving pools", () => {
    const items = [
      machineFactory({ system_id: "707" }),
      machineFactory({ system_id: "808" }),
      machineFactory({ system_id: "909" }),
    ];
    const statuses = machineStatusesFactory({
      "707": machineStatusFactory({ settingPool: true }),
      "808": machineStatusFactory(),
      "909": machineStatusFactory({ settingPool: true }),
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
        selected: ["909"],
        statuses,
      }),
    });
    expect(machine.settingPoolSelected(state)).toStrictEqual([items[2]]);
  });

  it("can get machines that are deleting interfaces", () => {
    const items = [
      machineFactory({ system_id: "808" }),
      machineFactory({ system_id: "909" }),
    ];
    const statuses = machineStatusesFactory({
      "808": machineStatusFactory(),
      "909": machineStatusFactory({ deletingInterface: true }),
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
        statuses,
      }),
    });
    expect(machine.deletingInterface(state)).toStrictEqual([items[1]]);
  });

  it("can get selected machines that are deleting interfaces", () => {
    const items = [
      machineFactory({ system_id: "707" }),
      machineFactory({ system_id: "808" }),
      machineFactory({ system_id: "909" }),
    ];
    const statuses = machineStatusesFactory({
      "707": machineStatusFactory({ deletingInterface: true }),
      "808": machineStatusFactory(),
      "909": machineStatusFactory({ deletingInterface: true }),
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
        selected: ["909"],
        statuses,
      }),
    });
    expect(machine.deletingInterfaceSelected(state)).toStrictEqual([items[2]]);
  });

  it("can get machines that are linking subnets", () => {
    const items = [
      machineFactory({ system_id: "808" }),
      machineFactory({ system_id: "909" }),
    ];
    const statuses = machineStatusesFactory({
      "808": machineStatusFactory(),
      "909": machineStatusFactory({ linkingSubnet: true }),
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
        statuses,
      }),
    });
    expect(machine.linkingSubnet(state)).toStrictEqual([items[1]]);
  });

  it("can get selected machines that are linking subnets", () => {
    const items = [
      machineFactory({ system_id: "707" }),
      machineFactory({ system_id: "808" }),
      machineFactory({ system_id: "909" }),
    ];
    const statuses = machineStatusesFactory({
      "707": machineStatusFactory({ linkingSubnet: true }),
      "808": machineStatusFactory(),
      "909": machineStatusFactory({ linkingSubnet: true }),
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
        selected: ["909"],
        statuses,
      }),
    });
    expect(machine.linkingSubnetSelected(state)).toStrictEqual([items[2]]);
  });

  it("can get machines that are unlinking subnets", () => {
    const items = [
      machineFactory({ system_id: "808" }),
      machineFactory({ system_id: "909" }),
    ];
    const statuses = machineStatusesFactory({
      "808": machineStatusFactory(),
      "909": machineStatusFactory({ unlinkingSubnet: true }),
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
        statuses,
      }),
    });
    expect(machine.unlinkingSubnet(state)).toStrictEqual([items[1]]);
  });

  it("can get selected machines that are unlinking subnets", () => {
    const items = [
      machineFactory({ system_id: "707" }),
      machineFactory({ system_id: "808" }),
      machineFactory({ system_id: "909" }),
    ];
    const statuses = machineStatusesFactory({
      "707": machineStatusFactory({ unlinkingSubnet: true }),
      "808": machineStatusFactory(),
      "909": machineStatusFactory({ unlinkingSubnet: true }),
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
        selected: ["909"],
        statuses,
      }),
    });
    expect(machine.unlinkingSubnetSelected(state)).toStrictEqual([items[2]]);
  });

  it("can get machines that are creating physical interfaces", () => {
    const items = [
      machineFactory({ system_id: "808" }),
      machineFactory({ system_id: "909" }),
    ];
    const statuses = machineStatusesFactory({
      "808": machineStatusFactory(),
      "909": machineStatusFactory({ creatingPhysical: true }),
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
        statuses,
      }),
    });
    expect(machine.creatingPhysical(state)).toStrictEqual([items[1]]);
  });

  it("can get selected machines that are creating physical interfaces", () => {
    const items = [
      machineFactory({ system_id: "707" }),
      machineFactory({ system_id: "808" }),
      machineFactory({ system_id: "909" }),
    ];
    const statuses = machineStatusesFactory({
      "707": machineStatusFactory({ creatingPhysical: true }),
      "808": machineStatusFactory(),
      "909": machineStatusFactory({ creatingPhysical: true }),
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
        selected: ["909"],
        statuses,
      }),
    });
    expect(machine.creatingPhysicalSelected(state)).toStrictEqual([items[2]]);
  });

  it("can get all event errors", () => {
    const machineEventErrors = [
      machineEventErrorFactory(),
      machineEventErrorFactory(),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        eventErrors: machineEventErrors,
      }),
    });
    expect(machine.eventErrors(state)).toStrictEqual(machineEventErrors);
  });

  it("can get event errors for a machine", () => {
    const machineEventErrors = [
      machineEventErrorFactory({ id: "abc123" }),
      machineEventErrorFactory(),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        eventErrors: machineEventErrors,
      }),
    });
    expect(machine.eventErrorsForIds(state, "abc123")).toStrictEqual([
      machineEventErrors[0],
    ]);
  });

  it("can get event errors for a machine and a provided event", () => {
    const machineEventErrors = [
      machineEventErrorFactory({ id: "abc123", event: NodeActions.TAG }),
      machineEventErrorFactory({ event: NodeActions.TAG }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        eventErrors: machineEventErrors,
      }),
    });
    expect(machine.eventErrorsForIds(state, "abc123")).toStrictEqual([
      machineEventErrors[0],
    ]);
  });

  it("can get event errors for a machine and no event", () => {
    const machineEventErrors = [
      machineEventErrorFactory({ id: "abc123", event: null }),
      machineEventErrorFactory({ id: "abc123", event: NodeActions.TAG }),
      machineEventErrorFactory({ event: null }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        eventErrors: machineEventErrors,
      }),
    });
    expect(machine.eventErrorsForIds(state, "abc123", null)).toStrictEqual([
      machineEventErrors[0],
    ]);
  });

  it("can get event errors for multiple machines", () => {
    const machineEventErrors = [
      machineEventErrorFactory({ id: "abc123" }),
      machineEventErrorFactory({ id: "def456" }),
      machineEventErrorFactory(),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        eventErrors: machineEventErrors,
      }),
    });
    expect(
      machine.eventErrorsForIds(state, ["abc123", "def456"])
    ).toStrictEqual([machineEventErrors[0], machineEventErrors[1]]);
  });

  it("can get event errors for multiple machines and a provided event", () => {
    const machineEventErrors = [
      machineEventErrorFactory({ id: "abc123", event: NodeActions.TAG }),
      machineEventErrorFactory({ id: "def456", event: NodeActions.TAG }),
      machineEventErrorFactory({ event: NodeActions.TAG }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        eventErrors: machineEventErrors,
      }),
    });
    expect(
      machine.eventErrorsForIds(state, ["abc123", "def456"], NodeActions.TAG)
    ).toStrictEqual([machineEventErrors[0], machineEventErrors[1]]);
  });

  it("can get event errors for multiple machines and no event", () => {
    const machineEventErrors = [
      machineEventErrorFactory({ id: "abc123", event: null }),
      machineEventErrorFactory({ id: "def456", event: null }),
      machineEventErrorFactory({ id: "abc123", event: NodeActions.TAG }),
      machineEventErrorFactory({ id: "def456", event: NodeActions.TAG }),
      machineEventErrorFactory({ event: null }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        eventErrors: machineEventErrors,
      }),
    });
    expect(
      machine.eventErrorsForIds(state, ["abc123", "def456"], null)
    ).toStrictEqual([machineEventErrors[0], machineEventErrors[1]]);
  });

  it("can search items", () => {
    const items = [machineFactory({ hostname: "abc" }), machineFactory()];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
      }),
    });
    expect(machine.search(state, "abc")).toStrictEqual([items[0]]);
  });

  it("can search items starting with a number", () => {
    const items = [machineFactory({ hostname: "1abc" }), machineFactory()];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items,
      }),
    });
    expect(machine.search(state, "1abc")).toStrictEqual([items[0]]);
  });

  it("can get an interface by id", () => {
    const nic = machineInterfaceFactory({
      type: NetworkInterfaceTypes.PHYSICAL,
    });
    const node = machineDetailsFactory({
      interfaces: [nic],
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [node],
      }),
    });
    expect(
      machine.getInterfaceById(state, node.system_id, nic.id)
    ).toStrictEqual(nic);
  });

  it("can get an interface by link id", () => {
    const link = networkLinkFactory();
    const nic = machineInterfaceFactory({
      links: [link],
      type: NetworkInterfaceTypes.PHYSICAL,
    });
    const node = machineDetailsFactory({
      interfaces: [nic],
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [node],
      }),
    });
    expect(
      machine.getInterfaceById(state, node.system_id, null, link.id)
    ).toStrictEqual(nic);
  });
});
