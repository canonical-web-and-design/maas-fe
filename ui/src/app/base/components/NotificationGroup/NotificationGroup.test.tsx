import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import NotificationGroup from "./NotificationGroup";

import {
  notification as notificationFactory,
  notificationState as notificationStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("NotificationGroup", () => {
  it("renders", () => {
    const notifications = [notificationFactory(), notificationFactory()];

    const state = rootStateFactory({
      notification: notificationStateFactory({
        items: notifications,
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <NotificationGroup
              notifications={notifications}
              severity="negative"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("NotificationGroup")).toMatchSnapshot();
  });

  it("hides multiple notifications by default", () => {
    const notifications = [notificationFactory(), notificationFactory()];

    const state = rootStateFactory({
      notification: notificationStateFactory({
        items: notifications,
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <NotificationGroup
              notifications={notifications}
              severity="negative"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find("span[data-testid='notification-message']").exists()
    ).toBe(false);
  });

  it("displays a count for multiple notifications", () => {
    const notifications = [notificationFactory(), notificationFactory()];

    const state = rootStateFactory({
      notification: notificationStateFactory({
        items: notifications,
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <NotificationGroup
              notifications={notifications}
              severity="negative"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper.find("span[data-testid='notification-count']").text()
    ).toEqual("2 Warnings");
  });

  it("does not display a dismiss all link if none can be dismissed", () => {
    const notifications = [
      notificationFactory({ dismissable: false }),
      notificationFactory({ dismissable: false }),
    ];
    const state = rootStateFactory({
      notification: notificationStateFactory({
        items: notifications,
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <NotificationGroup
              notifications={notifications}
              severity="negative"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(
      wrapper
        .findWhere((n) => n.name() === "Button" && n.text() === "Dismiss all")
        .exists()
    ).toBe(false);
  });

  it("can dismiss multiple notifications", () => {
    const notifications = [
      notificationFactory({ dismissable: true }),
      notificationFactory({ dismissable: true }),
    ];

    const state = rootStateFactory({
      notification: notificationStateFactory({
        items: notifications,
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <NotificationGroup
              notifications={notifications}
              severity="negative"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    wrapper.find("Button").at(1).simulate("click");

    expect(store.getActions().length).toEqual(2);
    expect(store.getActions()[0].type).toEqual("notification/dismiss");
    expect(store.getActions()[1].type).toEqual("notification/dismiss");
  });

  it("does not dismiss undismissable notifications when dismissing a group", () => {
    const notifications = [
      notificationFactory({ dismissable: true }),
      notificationFactory({ dismissable: false }),
    ];

    const state = rootStateFactory({
      notification: notificationStateFactory({
        items: notifications,
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <NotificationGroup
              notifications={notifications}
              severity="caution"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    wrapper.find("Button").at(1).simulate("click");

    expect(store.getActions().length).toEqual(1);
    expect(store.getActions()[0].type).toEqual("notification/dismiss");
  });

  it("can toggle multiple notifications", () => {
    const notifications = [
      notificationFactory(),
      notificationFactory(),
      notificationFactory(),
    ];

    const state = rootStateFactory({
      notification: notificationStateFactory({
        items: notifications,
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter>
          <CompatRouter>
            <NotificationGroup
              notifications={notifications}
              severity="negative"
            />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("Notification").length).toEqual(1);

    wrapper.find("Button").at(0).simulate("click");

    expect(wrapper.find("Notification").length).toEqual(4);
  });
});
