import { call, put, takeLatest } from "redux-saga/effects";

import getCookie from "./utils";

const SCRIPTS_API = `/MAAS/api/2.0/scripts/`;

export const api = {
  fetchScripts: csrftoken => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-CSRFToken": csrftoken
    };
    return fetch(SCRIPTS_API, { headers }).then(response => response.json());
  }
};

export function* fetchScriptsSaga() {
  const csrftoken = yield call(getCookie, "csrftoken");
  let response;
  try {
    yield put({ type: `FETCH_SCRIPTS_START` });
    response = yield call(api.fetchScripts, csrftoken);
    yield put({
      type: `FETCH_SCRIPTS_SUCCESS`,
      payload: response
    });
  } catch (error) {
    yield put({
      type: `FETCH_SCRIPTS_ERROR`,
      error
    });
  }
}

export function* watchFetchScripts() {
  yield takeLatest("FETCH_SCRIPTS", fetchScriptsSaga);
}
