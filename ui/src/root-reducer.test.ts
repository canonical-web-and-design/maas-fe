import type { History } from "history";

import createRootReducer from "./root-reducer";

import type { RootState } from "app/store/root/types";

describe("rootReducer", () => {
  it(`should reset app to initial state on LOGOUT_SUCCESS, except status which
    resets to authenticating = false`, () => {
    const initialState = {
      status: { authenticating: true },
    } as RootState;
    const newState = createRootReducer({} as History)(initialState, {
      type: "status/logoutSuccess",
    });

    expect(newState.status.authenticating).toBe(false);
    expect(newState).toMatchSnapshot();
  });

  it("it should clear the state when disconnected from the websocket", () => {
    const initialState = {
      machine: {
        items: [1, 2, 3],
      },
      status: { authenticating: true },
      user: {
        items: [1, 2, 3],
        auth: {
          user: { id: 1 },
        },
      },
    } as RootState;
    const newState = createRootReducer({} as History)(initialState, {
      type: "status/websocketDisconnected",
    });

    expect(newState.machine.items.length).toBe(0);
    expect(newState.status.authenticating).toBe(true);
    expect(newState.user.items.length).toBe(0);
    expect(newState.user.auth.user).toStrictEqual({ id: 1 });
  });
});
