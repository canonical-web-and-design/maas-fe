import configureStore from "redux-mock-store";

import ChangeStorageLayoutMenu, {
  storageLayoutOptions,
} from "./ChangeStorageLayoutMenu";

import type { RootState } from "@/app/store/root/types";
import * as factory from "@/testing/factories";
import { renderWithBrowserRouter, screen, userEvent } from "@/testing/utils";

const mockStore = configureStore<RootState>();

let state: RootState;

beforeAll(() => {
  state = factory.rootState({
    machine: factory.machineState({
      items: [factory.machineDetails({ system_id: "abc123" })],
      statuses: factory.machineStatuses({
        abc123: factory.machineStatus(),
      }),
    }),
  });
});

it("renders", () => {
  const store = mockStore(state);
  renderWithBrowserRouter(<ChangeStorageLayoutMenu systemId="abc123" />, {
    store,
  });

  expect(
    screen.getByRole("button", { name: "Change storage layout" })
  ).toBeInTheDocument();
});

it("displays sub options when clicked", async () => {
  const store = mockStore(state);
  const testStorageOptions = storageLayoutOptions[0];
  renderWithBrowserRouter(<ChangeStorageLayoutMenu systemId="abc123" />, {
    store,
  });

  const storageBtn = screen.getByRole("button", {
    name: "Change storage layout",
  });
  await userEvent.click(storageBtn);
  testStorageOptions.forEach((option) => {
    expect(screen.getByRole("button", { name: option.label }));
  });
});
