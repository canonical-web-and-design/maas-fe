import { call, put, take } from "redux-saga/effects";
import { expectSaga } from "redux-saga-test-plan";

import {
  createConnection,
  handleMessage,
  sendMessage,
  watchMessages,
  watchWebSockets
} from "./websockets";
import getCookie from "./utils";
import WebSocketClient from "../../../websocket-client";

jest.mock("../../../websocket-client");

describe("websocket sagas", () => {
  let socketChannel, socketClient;

  beforeEach(() => {
    process.env.REACT_APP_WEBSOCKET_URL = "ws://example.com/ws";

    socketClient = {
      getRequest: jest.fn(),
      send: jest.fn(),
      socket: {}
    };
    socketChannel = jest.fn();

    WebSocketClient.mockImplementation(() => {
      return socketClient;
    });
  });

  afterEach(() => {
    jest.resetModules();
  });

  it("connects to a WebSocket", () => {
    return expectSaga(watchWebSockets)
      .provide([
        [call(getCookie, "csrftoken"), "foo"],
        [call(createConnection, "foo"), {}]
      ])
      .take("WEBSOCKET_CONNECT")
      .put({
        type: "WEBSOCKET_CONNECTED"
      })
      .dispatch({
        type: "WEBSOCKET_CONNECT"
      })
      .run();
  });

  it("raises an error if no csrftoken exists", () => {
    const error = new Error(
      "No csrftoken found, please ensure you are logged into MAAS."
    );
    return expectSaga(watchWebSockets)
      .provide([
        [call(getCookie, "csrftoken"), undefined],
        [call(createConnection, "foo"), {}]
      ])
      .take("WEBSOCKET_CONNECT")
      .put({ type: "WEBSOCKET_ERROR", error })
      .dispatch({
        type: "WEBSOCKET_CONNECT"
      })
      .run();
  });

  it("can create a WebSocket connection", () => {
    expect.assertions(1);
    const socket = createConnection();
    socketClient.socket.onopen();
    return expect(socket).resolves.toEqual(socketClient);
  });

  it("can handle WebSocket errors", () => {
    expect.assertions(1);
    const socket = createConnection();
    const error = { error: "it's bad, real bad" };
    socketClient.socket.onerror(error);
    return expect(socket).rejects.toEqual(error);
  });

  it("can watch for WebSocket messages", () => {
    const channel = watchMessages(socketClient);
    let response;
    channel.take(val => (response = val));
    socketClient.socket.onmessage({ data: '{"message": "secret"}' });
    expect(response).toEqual({ message: "secret" });
  });

  it("can send a WebSocket message", () => {
    const saga = sendMessage(socketClient);
    expect(saga.next().value).toEqual(take("WEBSOCKET_SEND"));
    expect(
      saga.next({
        type: "WEBSOCKET_SEND",
        payload: {
          actionType: "TEST_ACTION",
          message: { payload: "here" }
        }
      }).value
    ).toEqual(put({ type: "TEST_ACTION_START" }));
    expect(saga.next().value).toEqual(
      call([socketClient, socketClient.send], "TEST_ACTION", {
        payload: "here"
      })
    );
  });

  it("can handle errors when sending a WebSocket message", () => {
    const saga = sendMessage(socketClient);
    expect(saga.next().value).toEqual(take("WEBSOCKET_SEND"));
    expect(
      saga.next({
        type: "WEBSOCKET_SEND",
        payload: {
          actionType: "TEST_ACTION",
          message: { payload: "here" }
        }
      }).value
    ).toEqual(put({ type: "TEST_ACTION_START" }));
    expect(saga.next().value).toEqual(
      call([socketClient, socketClient.send], "TEST_ACTION", {
        payload: "here"
      })
    );
    expect(saga.next("ERROR!").value).toEqual(
      put({ type: "TEST_ACTION_ERROR", error: "ERROR!" })
    );
  });

  it("can receive a succesful WebSocket message", () => {
    const saga = handleMessage(socketChannel, socketClient);
    expect(saga.next().value).toEqual(take(socketChannel));
    expect(
      saga.next({ request_id: 99, result: { response: "here" } }).value
    ).toEqual(call([socketClient, socketClient.getRequest], 99));
    expect(saga.next("TEST_ACTION").value).toEqual(
      put({ type: "TEST_ACTION_SUCCESS", payload: { response: "here" } })
    );
  });

  it("can receive a WebSocket error message", () => {
    const saga = handleMessage(socketChannel, socketClient);
    expect(saga.next().value).toEqual(take(socketChannel));
    expect(
      saga.next({
        request_id: 99,
        error: '{"Message": "catastrophic failure"}'
      }).value
    ).toEqual(call([socketClient, socketClient.getRequest], 99));
    expect(saga.next("TEST_ACTION").value).toEqual(
      put({
        type: "TEST_ACTION_ERROR",
        error: { Message: "catastrophic failure" }
      })
    );
  });
});
