import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import { BulkAction } from "../AvailableStorageTable";

import BulkActions from "./BulkActions";

import { DiskTypes, StorageLayout } from "app/store/types/enum";
import {
  machineDetails as machineDetailsFactory,
  machineState as machineStateFactory,
  machineStatus as machineStatusFactory,
  machineStatuses as machineStatusesFactory,
  nodeDisk as diskFactory,
  nodeFilesystem as fsFactory,
  nodePartition as partitionFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("BulkActions", () => {
  it("disables create volume group button with tooltip if selected devices are not eligible", () => {
    const selected = [
      diskFactory({
        partitions: [partitionFactory()],
        type: DiskTypes.PHYSICAL,
      }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            disks: selected,
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
            <BulkActions
              bulkAction={null}
              selected={selected}
              setBulkAction={jest.fn()}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find("button[data-testid='create-vg']").prop("disabled")
    ).toBe(true);
    expect(wrapper.find("[data-testid='create-vg-tooltip']").exists()).toBe(
      true
    );
  });

  it("enables create volume group button if selected devices are eligible", () => {
    const selected = [
      diskFactory({ partitions: null, type: DiskTypes.PHYSICAL }),
      partitionFactory({ filesystem: null }),
    ];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
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
            <BulkActions
              bulkAction={null}
              selected={selected}
              setBulkAction={jest.fn()}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find("button[data-testid='create-vg']").prop("disabled")
    ).toBe(false);
  });

  it("renders datastore bulk actions if the detected layout is a VMWare layout", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            detected_storage_layout: StorageLayout.VMFS7,
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
            <BulkActions
              bulkAction={null}
              selected={[]}
              setBulkAction={jest.fn()}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-testid='vmware-bulk-actions']").exists()).toBe(
      true
    );
  });

  it(`enables the create datastore button if at least one unpartitioned and
    unformatted device is selected`, () => {
    const selected = [diskFactory({ filesystem: null, partitions: null })];
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            detected_storage_layout: StorageLayout.VMFS6,
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
            <BulkActions
              bulkAction={null}
              selected={selected}
              setBulkAction={jest.fn()}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find("button[data-testid='create-datastore']").prop("disabled")
    ).toBe(false);
  });

  it(`enables the add to existing datastore button if at least one unpartitioned
    and unformatted device is selected and at least one datastore exists`, () => {
    const datastore = diskFactory({
      filesystem: fsFactory({ fstype: "vmfs6" }),
    });
    const selected = diskFactory({ filesystem: null, partitions: null });
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            detected_storage_layout: StorageLayout.VMFS6,
            disks: [datastore, selected],
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
            <BulkActions
              bulkAction={null}
              selected={[selected]}
              setBulkAction={jest.fn()}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find("button[data-testid='add-to-datastore']").prop("disabled")
    ).toBe(false);
  });

  it("can render the create datastore form", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
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
            <BulkActions
              bulkAction={BulkAction.CREATE_DATASTORE}
              selected={[]}
              setBulkAction={jest.fn()}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("CreateDatastore").exists()).toBe(true);
  });

  it("can render the create RAID form", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
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
            <BulkActions
              bulkAction={BulkAction.CREATE_RAID}
              selected={[]}
              setBulkAction={jest.fn()}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("CreateRaid").exists()).toBe(true);
  });

  it("can render the create volume group form", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
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
            <BulkActions
              bulkAction={BulkAction.CREATE_VOLUME_GROUP}
              selected={[]}
              setBulkAction={jest.fn()}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("CreateVolumeGroup").exists()).toBe(true);
  });

  it("can render the update datastore form", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
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
            <BulkActions
              bulkAction={BulkAction.UPDATE_DATASTORE}
              selected={[]}
              setBulkAction={jest.fn()}
              systemId="abc123"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("UpdateDatastore").exists()).toBe(true);
  });
});
