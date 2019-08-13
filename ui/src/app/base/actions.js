export const connectWebSocket = () => {
  return {
    type: "WEBSOCKET_CONNECT"
  };
};

export const fetchAuthUser = () => {
  return {
    type: "FETCH_AUTH_USER",
    meta: {
      method: "user.auth_user",
      type: 0
    }
  };
};
