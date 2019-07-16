import { shallow } from "enzyme";
import React from "react";

import { App } from "./App";

describe("App", () => {
  it("renders", () => {
    const wrapper = shallow(
      <App
        connected={true}
        connectionError={null}
        connectWebSocket={jest.fn()}
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it("displays connection errors", () => {
    const wrapper = shallow(
      <App
        connected={true}
        connectionError={{ error: "Error!" }}
        connectWebSocket={jest.fn()}
      />
    );
    expect(wrapper.text()).toBe(
      "Failed to connect. Please try refreshing your browser."
    );
  });

  it("displays a loading message", () => {
    const wrapper = shallow(
      <App
        connected={false}
        connectionError={null}
        connectWebSocket={jest.fn()}
      />
    );
    expect(wrapper.text()).toBe("Loading…");
  });

  it("connects to the WebSocket", () => {
    const connectWebSocket = jest.fn();
    shallow(
      <App
        connected={false}
        connectionError={null}
        connectWebSocket={connectWebSocket}
      />
    );
    expect(connectWebSocket.mock.calls.length).toBe(1);
  });
});
