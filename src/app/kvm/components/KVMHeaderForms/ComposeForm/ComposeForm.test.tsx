import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import ComposeForm, {
  createInterfaceConstraints,
  createStorageConstraints,
  getDefaultPoolLocation,
} from "./ComposeForm";

import { PodType } from "app/store/pod/constants";
import type { RootState } from "app/store/root/types";
import {
  domainState as domainStateFactory,
  fabricState as fabricStateFactory,
  generalState as generalStateFactory,
  podDetails as podDetailsFactory,
  podState as podStateFactory,
  podStatus as podStatusFactory,
  podStoragePool as podStoragePoolFactory,
  powerTypesState as powerTypesStateFactory,
  resourcePoolState as resourcePoolStateFactory,
  rootState as rootStateFactory,
  space as spaceFactory,
  spaceState as spaceStateFactory,
  subnet as subnetFactory,
  subnetState as subnetStateFactory,
  vlanState as vlanStateFactory,
  zoneGenericActions as zoneGenericActionsFactory,
  zoneState as zoneStateFactory,
} from "testing/factories";
import { submitFormikForm } from "testing/utils";

const mockStore = configureStore();

describe("ComposeForm", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory({
      domain: domainStateFactory({
        loaded: true,
      }),
      fabric: fabricStateFactory({
        loaded: true,
      }),
      general: generalStateFactory({
        powerTypes: powerTypesStateFactory({ loaded: true }),
      }),
      pod: podStateFactory({
        items: [podDetailsFactory({ id: 1 })],
        loaded: true,
        statuses: { 1: podStatusFactory() },
      }),
      resourcepool: resourcePoolStateFactory({
        loaded: true,
      }),
      space: spaceStateFactory({
        loaded: true,
      }),
      subnet: subnetStateFactory({
        loaded: true,
      }),
      vlan: vlanStateFactory({
        loaded: true,
      }),
      zone: zoneStateFactory({
        genericActions: zoneGenericActionsFactory({ fetch: "success" }),
      }),
    });
  });

  it("fetches the necessary data on load", () => {
    const store = mockStore(state);
    mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <CompatRouter>
            <ComposeForm clearSidePanelContent={jest.fn()} hostId={1} />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    const expectedActions = [
      "FETCH_DOMAIN",
      "FETCH_FABRIC",
      "general/fetchPowerTypes",
      "resourcepool/fetch",
      "space/fetch",
      "subnet/fetch",
      "vlan/fetch",
      "zone/fetch",
      "GET_POD",
    ];
    const actions = store.getActions();
    expectedActions.forEach((expectedAction) => {
      expect(actions.some((action) => action.type === expectedAction));
    });
  });

  it("displays a spinner if data has not loaded", () => {
    state.zone.genericActions.fetch = "idle";
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <CompatRouter>
            <ComposeForm clearSidePanelContent={jest.fn()} hostId={1} />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Spinner").length).toBe(1);
  });

  it("can compose a machine without pinned cores", () => {
    const pod = podDetailsFactory({
      id: 1,
      storage_pools: [
        podStoragePoolFactory({ name: "pool-1" }),
        podStoragePoolFactory({ name: "pool-2 " }),
      ],
    });
    const space = spaceFactory({ id: 1, name: "outer" });
    const subnet = subnetFactory({ id: 10, cidr: "192.168.1.1/24" });
    state.pod.items = [pod];
    state.space.items = [space];
    state.subnet.items = [subnet];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <CompatRouter>
            <ComposeForm clearSidePanelContent={jest.fn()} hostId={1} />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      submitFormikForm(wrapper, {
        architecture: "amd64/generic",
        bootDisk: 2,
        cores: 5,
        disks: [
          {
            id: 1,
            location: "pool-1",
            size: 16,
            tags: ["tag1", "tag2"],
          },
          {
            id: 2,
            location: "pool-2",
            size: 32,
            tags: ["tag3"],
          },
        ],
        domain: "0",
        hostname: "mean-bean-machine",
        hugepagesBacked: true,
        id: "1",
        interfaces: [
          {
            id: 1,
            ipAddress: "192.168.1.1",
            name: "eth0",
            space: "1",
            subnet: "10",
          },
        ],
        memory: 4096,
        pinnedCores: "",
        pool: "2",
        zone: "3",
      })
    );
    expect(
      store.getActions().find((action) => action.type === "pod/compose")
    ).toStrictEqual({
      type: "pod/compose",
      meta: {
        method: "compose",
        model: "pod",
      },
      payload: {
        params: {
          architecture: "amd64/generic",
          cores: 5,
          domain: 0,
          hostname: "mean-bean-machine",
          hugepages_backed: true,
          id: 1,
          interfaces:
            "eth0:ip=192.168.1.1,space=outer,subnet_cidr=192.168.1.1/24",
          memory: 4096,
          pool: 2,
          storage: "2:32(pool-2,tag3),1:16(pool-1,tag1,tag2)",
          zone: 3,
        },
      },
    });
  });

  it("can compose a machine with pinned cores", () => {
    const pod = podDetailsFactory({
      id: 1,
      storage_pools: [
        podStoragePoolFactory({ name: "pool-1" }),
        podStoragePoolFactory({ name: "pool-2 " }),
      ],
    });
    const space = spaceFactory({ id: 1, name: "outer" });
    const subnet = subnetFactory({ id: 10, cidr: "192.168.1.1/24" });
    state.pod.items = [pod];
    state.space.items = [space];
    state.subnet.items = [subnet];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <CompatRouter>
            <ComposeForm clearSidePanelContent={jest.fn()} hostId={1} />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      submitFormikForm(wrapper, {
        architecture: "amd64/generic",
        bootDisk: 2,
        cores: "",
        disks: [
          {
            id: 1,
            location: "pool-1",
            size: 16,
            tags: ["tag1", "tag2"],
          },
          {
            id: 2,
            location: "pool-2",
            size: 32,
            tags: ["tag3"],
          },
        ],
        domain: "0",
        hostname: "mean-bean-machine",
        hugepagesBacked: true,
        id: "1",
        interfaces: [
          {
            id: 1,
            ipAddress: "192.168.1.1",
            name: "eth0",
            space: "1",
            subnet: "10",
          },
        ],
        memory: 4096,
        pinnedCores: "0-2, 4, 6-7",
        pool: "2",
        zone: "3",
      })
    );
    expect(
      store.getActions().find((action) => action.type === "pod/compose")
    ).toStrictEqual({
      type: "pod/compose",
      meta: {
        method: "compose",
        model: "pod",
      },
      payload: {
        params: {
          architecture: "amd64/generic",
          domain: 0,
          hostname: "mean-bean-machine",
          hugepages_backed: true,
          id: 1,
          interfaces:
            "eth0:ip=192.168.1.1,space=outer,subnet_cidr=192.168.1.1/24",
          memory: 4096,
          pinned_cores: [0, 1, 2, 4, 6, 7],
          pool: 2,
          storage: "2:32(pool-2,tag3),1:16(pool-1,tag1,tag2)",
          zone: 3,
        },
      },
    });
  });

  describe("createInterfacesConstraint", () => {
    it("returns an empty string if no interfaces are given", () => {
      expect(createInterfaceConstraints([], [], [])).toEqual("");
    });

    it("returns an empty string if no constraints are given", () => {
      const interfaceFields = [
        {
          id: 1,
          ipAddress: "",
          name: "eth0",
          space: "",
          subnet: "",
        },
      ];
      expect(createInterfaceConstraints(interfaceFields, [], [])).toEqual("");
    });

    it("can create a single interface constraint", () => {
      const space = spaceFactory();
      const subnet = subnetFactory();
      const interfaceFields = [
        {
          id: 1,
          ipAddress: "192.168.1.1",
          name: "eth0",
          space: `${space.id}`,
          subnet: `${subnet.id}`,
        },
      ];
      expect(
        createInterfaceConstraints(interfaceFields, [space], [subnet])
      ).toEqual(
        `eth0:ip=${interfaceFields[0].ipAddress},space=${space.name},subnet_cidr=${subnet.cidr}`
      );
    });

    it("can create multiple interface constraints", () => {
      const [space1, space2] = [spaceFactory(), spaceFactory()];
      const [subnet1, subnet2] = [subnetFactory(), subnetFactory()];
      const [interface1, interface2] = [
        {
          id: 1,
          ipAddress: "192.168.1.1",
          name: "eth0",
          space: `${space1.id}`,
          subnet: `${subnet1.id}`,
        },
        {
          id: 2,
          ipAddress: "192.168.1.2",
          name: "eth1",
          space: `${space2.id}`,
          subnet: `${subnet2.id}`,
        },
      ];
      expect(
        createInterfaceConstraints(
          [interface1, interface2],
          [space1, space2],
          [subnet1, subnet2]
        )
      ).toEqual(
        `eth0:ip=${interface1.ipAddress},space=${space1.name},subnet_cidr=${subnet1.cidr};` +
          `eth1:ip=${interface2.ipAddress},space=${space2.name},subnet_cidr=${subnet2.cidr}`
      );
    });
  });

  describe("createStorageConstraints", () => {
    it("returns an empty string if no disks are given", () => {
      expect(createStorageConstraints()).toEqual("");
      expect(createStorageConstraints([])).toEqual("");
    });

    it("correctly returns storage constraint for pod compose action", () => {
      const [pool1, pool2] = [
        podStoragePoolFactory({ name: "pool-1" }),
        podStoragePoolFactory({ name: "pool-2" }),
      ];
      const [bootDisk, otherDisk] = [
        { id: 1, location: pool1.name, size: 16, tags: ["tag1", "tag2"] },
        { id: 2, location: pool2.name, size: 32, tags: ["tag3"] },
      ];

      expect(
        createStorageConstraints([otherDisk, bootDisk], bootDisk.id)
      ).toEqual(
        `${bootDisk.id}:${bootDisk.size}(${
          bootDisk.location
        },${bootDisk.tags.join(",")}),${otherDisk.id}:${otherDisk.size}(${
          otherDisk.location
        },${otherDisk.tags.join(",")})`
      );
    });
  });

  describe("getDefaultPoolLocation", () => {
    it("correctly returns default pool name", () => {
      const [defaultPool, otherPool] = [
        podStoragePoolFactory(),
        podStoragePoolFactory(),
      ];
      const pod = podDetailsFactory({
        default_storage_pool: defaultPool.id,
        storage_pools: [defaultPool, otherPool],
        type: PodType.LXD,
      });
      expect(getDefaultPoolLocation(pod)).toBe(defaultPool.name);
    });
  });
});
