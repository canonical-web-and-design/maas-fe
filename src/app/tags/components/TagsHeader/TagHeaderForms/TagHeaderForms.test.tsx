import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import TagHeaderForms from "./TagHeaderForms";

import { TagHeaderViews } from "app/tags/constants";
import {
  rootState as rootStateFactory,
  tag as tagFactory,
  tagState as tagStateFactory,
} from "testing/factories";
import { render, screen } from "testing/utils";

const mockStore = configureStore();
let scrollToSpy: jest.Mock;

beforeEach(() => {
  // Mock the scrollTo method as jsdom doesn't support this and will error.
  scrollToSpy = jest.fn();
  global.scrollTo = scrollToSpy;
});

afterEach(() => {
  jest.restoreAllMocks();
});

it("can display the add tag form", () => {
  const store = mockStore(rootStateFactory());
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{ pathname: "/tags", key: "testKey" }]}>
        <CompatRouter>
          <TagHeaderForms
            setSidePanelContent={jest.fn()}
            sidePanelContent={{ view: TagHeaderViews.AddTag }}
          />
        </CompatRouter>
      </MemoryRouter>
    </Provider>
  );
  expect(screen.getByRole("form", { name: "Create tag" })).toBeInTheDocument();
});

it("can display the delete tag form", () => {
  const store = mockStore(
    rootStateFactory({
      tag: tagStateFactory({
        items: [
          tagFactory({
            id: 1,
          }),
        ],
      }),
    })
  );
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[{ pathname: "/tags", key: "testKey" }]}>
        <CompatRouter>
          <TagHeaderForms
            setSidePanelContent={jest.fn()}
            sidePanelContent={{
              view: TagHeaderViews.DeleteTag,
              extras: { id: 1 },
            }}
          />
        </CompatRouter>
      </MemoryRouter>
    </Provider>
  );
  expect(screen.getByRole("form", { name: "Delete tag" })).toBeInTheDocument();
});
