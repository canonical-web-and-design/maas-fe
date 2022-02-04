import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import ConfigureDHCP from "./ConfigureDHCP";

import { actions as vlanActions } from "app/store/vlan";
import {
  controller as controllerFactory,
  controllerState as controllerStateFactory,
  fabricState as fabricStateFactory,
  rootState as rootStateFactory,
  vlan as vlanFactory,
  vlanState as vlanStateFactory,
} from "testing/factories";

const mockStore = configureStore();

it("shows a spinner while data is loading", () => {
  const state = rootStateFactory({
    fabric: fabricStateFactory({ items: [], loading: true }),
    vlan: vlanStateFactory({ items: [] }),
  });
  const store = mockStore(state);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ConfigureDHCP closeForm={jest.fn()} id={1} />
      </MemoryRouter>
    </Provider>
  );

  expect(screen.getByTestId("loading-data")).toBeInTheDocument();
});

it("correctly initialises data if the VLAN has DHCP from rack controllers", () => {
  const primary = controllerFactory({ system_id: "abc123" });
  const secondary = controllerFactory({ system_id: "def456" });
  const vlan = vlanFactory({
    id: 1,
    primary_rack: primary.system_id,
    rack_sids: [primary.system_id, secondary.system_id],
    relay_vlan: null,
    secondary_rack: secondary.system_id,
  });
  const state = rootStateFactory({
    controller: controllerStateFactory({
      items: [primary, secondary, controllerFactory(), controllerFactory()],
    }),
    vlan: vlanStateFactory({ items: [vlan] }),
  });
  const store = mockStore(state);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ConfigureDHCP closeForm={jest.fn()} id={1} />
      </MemoryRouter>
    </Provider>
  );

  expect(
    screen.getByRole("radio", { name: "Provide DHCP from rack controller(s)" })
  ).toBeChecked();
  expect(
    screen.getByRole("radio", { name: "Relay to another VLAN" })
  ).not.toBeChecked();
  expect(screen.getByRole("combobox", { name: "Primary rack" })).toHaveValue(
    primary.system_id
  );
  expect(screen.getByRole("combobox", { name: "Secondary rack" })).toHaveValue(
    secondary.system_id
  );
  expect(
    screen.queryByRole("combobox", { name: "VLAN" })
  ).not.toBeInTheDocument();
});

it("correctly initialises data if the VLAN has relayed DHCP", () => {
  const relay = vlanFactory({ dhcp_on: true, id: 2 });
  const vlan = vlanFactory({
    id: 1,
    primary_rack: null,
    rack_sids: [],
    relay_vlan: relay.id,
    secondary_rack: null,
  });
  const state = rootStateFactory({
    vlan: vlanStateFactory({ items: [relay, vlan] }),
  });
  const store = mockStore(state);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ConfigureDHCP closeForm={jest.fn()} id={1} />
      </MemoryRouter>
    </Provider>
  );

  expect(
    screen.getByRole("radio", { name: "Relay to another VLAN" })
  ).toBeChecked();
  expect(
    screen.getByRole("radio", { name: "Provide DHCP from rack controller(s)" })
  ).not.toBeChecked();
  expect(screen.getByRole("combobox", { name: "VLAN" })).toHaveValue(
    relay.id.toString()
  );
  expect(
    screen.queryByRole("combobox", { name: "Primary rack" })
  ).not.toBeInTheDocument();
  expect(
    screen.queryByRole("combobox", { name: "Secondary rack" })
  ).not.toBeInTheDocument();
});

it("shows an error if no rack controllers are connected to the VLAN", () => {
  const vlan = vlanFactory({
    id: 1,
    primary_rack: null,
    rack_sids: [],
    relay_vlan: null,
    secondary_rack: null,
  });
  const state = rootStateFactory({
    vlan: vlanStateFactory({ items: [vlan] }),
  });
  const store = mockStore(state);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ConfigureDHCP closeForm={jest.fn()} id={1} />
      </MemoryRouter>
    </Provider>
  );

  expect(
    screen.getByText(
      "This VLAN is not currently being utilised on any rack controller."
    )
  ).toBeInTheDocument();
});

it("shows a warning when attempting to disable DHCP on a VLAN", async () => {
  const vlan = vlanFactory({
    id: 1,
    primary_rack: null,
    rack_sids: [],
    relay_vlan: null,
    secondary_rack: null,
  });
  const state = rootStateFactory({
    vlan: vlanStateFactory({ items: [vlan] }),
  });
  const store = mockStore(state);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ConfigureDHCP closeForm={jest.fn()} id={1} />
      </MemoryRouter>
    </Provider>
  );

  await waitFor(() => {
    fireEvent.click(
      screen.getByRole("checkbox", { name: "MAAS provides DHCP" })
    );
  });

  expect(
    screen.getByText(
      "Are you sure you want to disable DHCP relay on this VLAN? All subnets on this VLAN will be affected."
    )
  ).toBeInTheDocument();
});

it("can configure DHCP with rack controllers", async () => {
  const primary = controllerFactory({ system_id: "abc123" });
  const secondary = controllerFactory({ system_id: "def456" });
  const vlan = vlanFactory({
    id: 1,
    primary_rack: null,
    rack_sids: [primary.system_id, secondary.system_id],
    relay_vlan: null,
    secondary_rack: null,
  });
  const state = rootStateFactory({
    controller: controllerStateFactory({
      items: [primary, secondary],
    }),
    vlan: vlanStateFactory({ items: [vlan] }),
  });
  const store = mockStore(state);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ConfigureDHCP closeForm={jest.fn()} id={1} />
      </MemoryRouter>
    </Provider>
  );

  await waitFor(() => {
    fireEvent.change(screen.getByRole("combobox", { name: "Primary rack" }), {
      target: { value: primary.system_id },
    });
    fireEvent.change(screen.getByRole("combobox", { name: "Secondary rack" }), {
      target: { value: secondary.system_id },
    });
    fireEvent.click(screen.getByRole("button", { name: "Configure DHCP" }));
  });

  const expectedAction = vlanActions.configureDHCP({
    controllers: [primary.system_id, secondary.system_id],
    id: vlan.id,
    relay_vlan: null,
  });
  const actualAction = store
    .getActions()
    .find((action) => action.type === expectedAction.type);
  expect(actualAction).toStrictEqual(expectedAction);
});

it("can configure relayed DHCP", async () => {
  const relay = vlanFactory({ dhcp_on: true, id: 2 });
  const vlan = vlanFactory({
    id: 1,
    primary_rack: null,
    rack_sids: [],
    relay_vlan: null,
    secondary_rack: null,
  });
  const state = rootStateFactory({
    vlan: vlanStateFactory({ items: [relay, vlan] }),
  });
  const store = mockStore(state);
  render(
    <Provider store={store}>
      <MemoryRouter>
        <ConfigureDHCP closeForm={jest.fn()} id={1} />
      </MemoryRouter>
    </Provider>
  );

  await waitFor(() => {
    fireEvent.click(
      screen.getByRole("radio", { name: "Relay to another VLAN" })
    );
    fireEvent.change(screen.getByRole("combobox", { name: "VLAN" }), {
      target: { value: relay.id.toString() },
    });
    fireEvent.click(screen.getByRole("button", { name: "Configure DHCP" }));
  });

  const expectedAction = vlanActions.configureDHCP({
    controllers: [],
    id: vlan.id,
    relay_vlan: relay.id,
  });
  const actualAction = store
    .getActions()
    .find((action) => action.type === expectedAction.type);
  expect(actualAction).toStrictEqual(expectedAction);
});
