import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import NodeNameFields from "./NodeNameFields";

import FormikForm from "app/base/components/FormikForm";
import type { RootState } from "app/store/root/types";
import {
  domainState as domainStateFactory,
  machineDetails as machineDetailsFactory,
  machineState as machineStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("NodeNameFields", () => {
  let state: RootState;
  beforeEach(() => {
    state = rootStateFactory({
      domain: domainStateFactory({
        loaded: true,
      }),
      machine: machineStateFactory({
        loaded: true,
        items: [
          machineDetailsFactory({
            locked: false,
            permissions: ["edit"],
            system_id: "abc123",
          }),
        ],
      }),
    });
  });

  it("displays a spinner when loading domains", () => {
    state.domain.loaded = false;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <CompatRouter>
            <FormikForm
              initialValues={{
                domain: "",
                hostname: "",
              }}
              onSubmit={jest.fn()}
            >
              <NodeNameFields setHostnameError={jest.fn()} />
            </FormikForm>
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("Spinner").exists()).toBe(true);
  });

  it("displays the fields", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <CompatRouter>
            <FormikForm
              initialValues={{
                domain: "",
                hostname: "",
              }}
              onSubmit={jest.fn()}
            >
              <NodeNameFields canEditHostname setHostnameError={jest.fn()} />
            </FormikForm>
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("NodeNameFields")).toMatchSnapshot();
  });

  it("disables fields when saving", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <CompatRouter>
            <FormikForm
              initialValues={{
                domain: "",
                hostname: "",
              }}
              onSubmit={jest.fn()}
            >
              <NodeNameFields
                canEditHostname
                saving
                setHostnameError={jest.fn()}
              />
            </FormikForm>
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(
      wrapper.find("FormikField").everyWhere((n) => Boolean(n.prop("disabled")))
    ).toBe(true);
  });

  it("updates the hostname errors if they exist", () => {
    const setHostnameError = jest.fn();
    const store = mockStore(state);
    mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
        >
          <CompatRouter>
            <FormikForm
              initialErrors={{ hostname: "Uh oh!" }}
              initialValues={{
                domain: "",
                hostname: "",
              }}
              onSubmit={jest.fn()}
            >
              <NodeNameFields
                canEditHostname
                saving
                setHostnameError={setHostnameError}
              />
            </FormikForm>
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(setHostnameError).toHaveBeenCalledWith("Uh oh!");
  });
});
