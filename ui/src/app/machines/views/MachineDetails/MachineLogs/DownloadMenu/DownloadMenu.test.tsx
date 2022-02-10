import { mount } from "enzyme";
import * as fileDownload from "js-file-download";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import DownloadMenu from "./DownloadMenu";

import FileContext, { fileContextStore } from "app/base/file-context";
import { api } from "app/base/sagas/http";
import type { RootState } from "app/store/root/types";
import {
  ScriptResultStatus,
  ScriptResultType,
  ScriptResultNames,
} from "app/store/scriptresult/types";
import { NodeStatus } from "app/store/types/node";
import {
  machineState as machineStateFactory,
  machineDetails as machineDetailsFactory,
  rootState as rootStateFactory,
  scriptResult as scriptResultFactory,
  scriptResultData as scriptResultDataFactory,
  scriptResultState as scriptResultStateFactory,
  nodeScriptResultState as nodeScriptResultStateFactory,
} from "testing/factories";

const mockStore = configureStore();

jest.mock("js-file-download", () => jest.fn());

describe("DownloadMenu", () => {
  let state: RootState;

  beforeEach(() => {
    jest
      .useFakeTimers("modern")
      .setSystemTime(new Date("2021-03-25").getTime());
    state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            fqdn: "hungry-wombat.aus",
            system_id: "abc123",
          }),
        ],
      }),
      nodescriptresult: nodeScriptResultStateFactory({
        items: { abc123: [1] },
      }),
      scriptresult: scriptResultStateFactory({
        items: [
          scriptResultFactory({
            id: 1,
            name: ScriptResultNames.INSTALL_LOG,
            result_type: ScriptResultType.INSTALLATION,
            status: ScriptResultStatus.PASSED,
          }),
        ],
        logs: {
          1: scriptResultDataFactory({
            combined: "installation-output log",
          }),
        },
      }),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it("is disabled if there are no downloads", () => {
    state.scriptresult.logs = {};
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DownloadMenu systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("ContextualMenu").prop("toggleDisabled")).toBe(true);
  });

  it("does not display a YAML output item when it does not exist", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DownloadMenu systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu:
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(wrapper.find("[data-testid='machine-output-yaml']").exists()).toBe(
      false
    );
  });

  it("can display a YAML output item", () => {
    jest.spyOn(fileContextStore, "get").mockReturnValue("test yaml file");
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <FileContext.Provider value={fileContextStore}>
            <DownloadMenu systemId="abc123" />
          </FileContext.Provider>
        </MemoryRouter>
      </Provider>
    );
    // Open the menu:
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(wrapper.find("[data-testid='machine-output-yaml']").exists()).toBe(
      true
    );
  });

  it("generates a download when the installation item is clicked", () => {
    jest.spyOn(fileContextStore, "get").mockReturnValue("test yaml file");
    jest
      .useFakeTimers("modern")
      .setSystemTime(new Date("2021-03-25").getTime());
    const downloadSpy = jest.spyOn(fileDownload, "default");
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DownloadMenu systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu:
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    wrapper
      .find("[data-testid='machine-output-yaml']")
      .last()
      .simulate("click");
    expect(downloadSpy).toHaveBeenCalledWith(
      "test yaml file",
      "hungry-wombat.aus-machine-output-2021-03-25.yaml"
    );
  });

  it("does not display a XML output item when it does not exist", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DownloadMenu systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu:
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(wrapper.find("[data-testid='machine-output-xml']").exists()).toBe(
      false
    );
  });

  it("can display a XML output item", () => {
    jest.spyOn(fileContextStore, "get").mockReturnValue("test xml file");
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <FileContext.Provider value={fileContextStore}>
            <DownloadMenu systemId="abc123" />
          </FileContext.Provider>
        </MemoryRouter>
      </Provider>
    );
    // Open the menu:
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(wrapper.find("[data-testid='machine-output-xml']").exists()).toBe(
      true
    );
  });

  it("generates a download when the installation item is clicked", () => {
    jest.spyOn(fileContextStore, "get").mockReturnValue("test xml file");
    jest
      .useFakeTimers("modern")
      .setSystemTime(new Date("2021-03-25").getTime());
    const downloadSpy = jest.spyOn(fileDownload, "default");
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DownloadMenu systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu:
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    wrapper.find("[data-testid='machine-output-xml']").last().simulate("click");
    expect(downloadSpy).toHaveBeenCalledWith(
      "test xml file",
      "hungry-wombat.aus-machine-output-2021-03-25.xml"
    );
  });

  it("does not display an installation output item when there is no log", () => {
    state.scriptresult.logs = {};
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DownloadMenu systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu:
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(wrapper.find("[data-testid='installation-output']").exists()).toBe(
      false
    );
  });

  it("can display an installation output item", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DownloadMenu systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu:
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(wrapper.find("[data-testid='installation-output']").exists()).toBe(
      true
    );
  });

  it("generates a download when the installation item is clicked", () => {
    const downloadSpy = jest.spyOn(fileDownload, "default");
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DownloadMenu systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu:
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    wrapper
      .find("[data-testid='installation-output']")
      .last()
      .simulate("click");
    expect(downloadSpy).toHaveBeenCalledWith(
      "installation-output log",
      "hungry-wombat.aus-installation-output-2021-03-25.log"
    );
  });

  it("does not display curtin logs item when there is no file", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DownloadMenu systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu:
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(wrapper.find("[data-testid='curtin-logs']").exists()).toBe(false);
  });

  it("can display an curtin logs item for a failed deployment", () => {
    state.machine.items[0].status = NodeStatus.FAILED_DEPLOYMENT;
    state.nodescriptresult.items.abc123.push(2);
    state.scriptresult.items.push(
      scriptResultFactory({
        id: 2,
        name: ScriptResultNames.CURTIN_LOG,
        result_type: ScriptResultType.INSTALLATION,
        status: ScriptResultStatus.PASSED,
      })
    );
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DownloadMenu systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu:
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(wrapper.find("[data-testid='curtin-logs']").exists()).toBe(true);
  });

  it("does not display a curtin logs item for other statuses", () => {
    state.machine.items[0].status = NodeStatus.FAILED_COMMISSIONING;
    state.nodescriptresult.items.abc123.push(2);
    state.scriptresult.items.push(
      scriptResultFactory({
        id: 2,
        name: ScriptResultNames.CURTIN_LOG,
        result_type: ScriptResultType.INSTALLATION,
        status: ScriptResultStatus.PASSED,
      })
    );
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DownloadMenu systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu:
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    expect(wrapper.find("[data-testid='curtin-logs']").exists()).toBe(false);
  });

  it("generates a download when the curtin logs item is clicked", async () => {
    state.machine.items[0].status = NodeStatus.FAILED_DEPLOYMENT;
    state.nodescriptresult.items.abc123.push(2);
    state.scriptresult.items.push(
      scriptResultFactory({
        id: 2,
        name: ScriptResultNames.CURTIN_LOG,
        result_type: ScriptResultType.INSTALLATION,
        status: ScriptResultStatus.PASSED,
      })
    );
    jest
      .spyOn(api.scriptresults, "getCurtinLogsTar")
      .mockResolvedValue("curtin-logs-blob");
    const downloadSpy = jest.spyOn(fileDownload, "default");
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <DownloadMenu systemId="abc123" />
        </MemoryRouter>
      </Provider>
    );
    // Open the menu:
    wrapper.find("Button.p-contextual-menu__toggle").simulate("click");
    wrapper.find("[data-testid='curtin-logs']").last().simulate("click");
    await Promise.resolve();
    expect(downloadSpy).toHaveBeenCalledWith(
      "curtin-logs-blob",
      "hungry-wombat.aus-curtin-2021-03-25.tar"
    );
  });
});
