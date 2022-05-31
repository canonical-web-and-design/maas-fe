import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import CreateVolumeGroup from "./CreateVolumeGroup";

import { DiskTypes } from "app/store/types/enum";
import {
  machineDetails as machineDetailsFactory,
  machineState as machineStateFactory,
  machineStatus as machineStatusFactory,
  machineStatuses as machineStatusesFactory,
  nodeDisk as diskFactory,
  nodePartition as partitionFactory,
  rootState as rootStateFactory,
} from "testing/factories";
import { submitFormikForm } from "testing/utils";

const mockStore = configureStore();

describe("CreateVolumeGroup", () => {
  it("sets the initial name correctly", () => {
    const vgs = [
      diskFactory({ type: DiskTypes.VOLUME_GROUP }),
      diskFactory({ type: DiskTypes.VOLUME_GROUP }),
    ];
    const physicalDisk = diskFactory({
      partitions: null,
      type: DiskTypes.PHYSICAL,
    });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            disks: [...vgs, physicalDisk],
            system_id: "abc123",
          }),
        ],
        statuses: machineStatusesFactory({
          abc123: machineStatusFactory(),
        }),
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <CreateVolumeGroup
              closeForm={jest.fn()}
              selected={[physicalDisk]}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    // Two volume groups already exist so the next one should be vg2
    expect(wrapper.find("Input[name='name']").prop("value")).toBe("vg2");
  });

  it("shows the details of the selected storage devices", () => {
    const [selectedDisk, selectedPartition] = [
      diskFactory({
        name: "floppy",
        partitions: null,
        type: DiskTypes.PHYSICAL,
      }),
      partitionFactory({ filesystem: null, name: "flippy" }),
    ];
    const disks = [
      selectedDisk,
      diskFactory({ partitions: [selectedPartition] }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [machineDetailsFactory({ disks: disks, system_id: "abc123" })],
        statuses: machineStatusesFactory({
          abc123: machineStatusFactory(),
        }),
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <CreateVolumeGroup
              closeForm={jest.fn()}
              selected={[selectedDisk, selectedPartition]}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("tbody TableRow").length).toBe(2);
    expect(
      wrapper.find("tbody TableRow").at(0).find("TableCell").at(0).text()
    ).toBe(selectedDisk.name);
    expect(
      wrapper.find("tbody TableRow").at(1).find("TableCell").at(0).text()
    ).toBe(selectedPartition.name);
  });

  it("correctly dispatches an action to create a volume group", () => {
    const [selectedDisk, selectedPartition] = [
      diskFactory({ partitions: null, type: DiskTypes.PHYSICAL }),
      partitionFactory({ filesystem: null }),
    ];
    const disks = [
      selectedDisk,
      diskFactory({ partitions: [selectedPartition] }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [machineDetailsFactory({ disks: disks, system_id: "abc123" })],
        statuses: machineStatusesFactory({
          abc123: machineStatusFactory(),
        }),
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <CreateVolumeGroup
              closeForm={jest.fn()}
              selected={[selectedDisk, selectedPartition]}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    submitFormikForm(wrapper, {
      name: "vg1",
    });

    expect(
      store
        .getActions()
        .find((action) => action.type === "machine/createVolumeGroup")
    ).toStrictEqual({
      meta: {
        method: "create_volume_group",
        model: "machine",
      },
      payload: {
        params: {
          block_devices: [selectedDisk.id],
          name: "vg1",
          partitions: [selectedPartition.id],
          system_id: "abc123",
        },
      },
      type: "machine/createVolumeGroup",
    });
  });
});
