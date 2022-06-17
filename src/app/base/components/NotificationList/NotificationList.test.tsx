import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { CompatRouter } from "react-router-dom-v5-compat";
import configureStore from "redux-mock-store";

import NotificationList from "./NotificationList";

import { ConfigNames } from "app/store/config/types";
import type { Notification } from "app/store/notification/types";
import {
  NotificationCategory,
  NotificationIdent,
} from "app/store/notification/types";
import type { RootState } from "app/store/root/types";
import {
  config as configFactory,
  configState as configStateFactory,
  locationState as locationStateFactory,
  message as messageFactory,
  messageState as messageStateFactory,
  notification as notificationFactory,
  notificationState as notificationStateFactory,
  rootState as rootStateFactory,
  routerState as routerStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("NotificationList", () => {
  let state: RootState;
  let notifications: Notification[];

  beforeEach(() => {
    notifications = [
      notificationFactory({
        id: 1,
        category: NotificationCategory.ERROR,
        message: "an error",
      }),
    ];
    state = rootStateFactory({
      config: configStateFactory({
        items: [
          configFactory({
            name: ConfigNames.RELEASE_NOTIFICATIONS,
            value: false,
          }),
        ],
      }),
      message: messageStateFactory({
        items: [messageFactory({ id: 1, message: "User deleted" })],
      }),
      notification: notificationStateFactory({
        items: notifications,
      }),
    });
  });

  it("renders a list of messages", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/machines" }]}>
          <CompatRouter>
            <NotificationList />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("NotificationList")).toMatchSnapshot();
  });

  it("can hide a message", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/machines" }]}>
          <CompatRouter>
            <NotificationList />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    wrapper
      .find("Notification [data-testid='notification-close-button']")
      .at(1)
      .simulate("click");

    expect(
      store.getActions().find((action) => action.type === "message/remove")
    ).toEqual({
      type: "message/remove",
      payload: 1,
    });
  });

  it("fetches notifications", () => {
    const store = mockStore(state);
    mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/machines" }]}>
          <CompatRouter>
            <NotificationList />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    expect(
      store.getActions().some((action) => action.type === "notification/fetch")
    ).toBe(true);
  });

  it("displays a single notification if only one of a certain category", () => {
    const notification = notificationFactory({
      category: NotificationCategory.ERROR,
    });
    state.notification.items = [notification];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/machines" }]}>
          <CompatRouter>
            <NotificationList />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    const notificationGroup = wrapper.find("NotificationGroup");
    const notificationComponent = wrapper.find("NotificationGroupNotification");

    expect(notificationGroup.exists()).toBe(false);
    expect(notificationComponent.exists()).toBe(true);
    expect(notificationComponent.props()).toEqual({
      id: notification.id,
      severity: "negative",
    });
  });

  it("displays a NotificationGroup for more than one notification of a category", () => {
    const notifications = [
      notificationFactory({
        category: NotificationCategory.ERROR,
      }),
      notificationFactory({
        category: NotificationCategory.ERROR,
      }),
    ];
    state.notification.items = notifications;
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/machines" }]}>
          <CompatRouter>
            <NotificationList />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );

    const notificationGroup = wrapper.find("NotificationGroup");

    expect(notificationGroup.exists()).toBe(true);
    expect(notificationGroup.props()).toEqual({
      severity: "negative",
      notifications,
    });
  });

  it("can display a release notification", () => {
    state = rootStateFactory({
      config: configStateFactory({
        items: [
          configFactory({
            name: ConfigNames.RELEASE_NOTIFICATIONS,
            value: true,
          }),
        ],
      }),
      notification: notificationStateFactory({
        items: [
          notificationFactory({
            category: NotificationCategory.INFO,
            ident: NotificationIdent.RELEASE,
          }),
        ],
      }),
      router: routerStateFactory({
        location: locationStateFactory({
          pathname: "/machines",
        }),
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/settings/general" }]}>
          <CompatRouter>
            <NotificationList />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("NotificationGroupNotification").exists()).toBe(true);
  });

  it("does not display a release notification for some urls", () => {
    state = rootStateFactory({
      config: configStateFactory({
        items: [
          configFactory({
            name: ConfigNames.RELEASE_NOTIFICATIONS,
            value: true,
          }),
        ],
      }),
      notification: notificationStateFactory({
        items: [
          notificationFactory({
            ident: NotificationIdent.RELEASE,
          }),
        ],
      }),
      router: routerStateFactory({
        location: locationStateFactory({
          pathname: "/kvm",
        }),
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm" }]}>
          <CompatRouter>
            <NotificationList />
          </CompatRouter>
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("NotificationGroupNotification").exists()).toBe(false);
  });
});
