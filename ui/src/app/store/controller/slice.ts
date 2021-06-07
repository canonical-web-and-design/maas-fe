import { createSlice } from "@reduxjs/toolkit";

import type { ControllerState, CreateParams, UpdateParams } from "./types";
import { ControllerMeta } from "./types";

import {
  generateCommonReducers,
  genericInitialState,
} from "app/store/utils/slice";

const controllerSlice = createSlice({
  name: ControllerMeta.MODEL,
  initialState: genericInitialState as ControllerState,
  reducers: generateCommonReducers<
    ControllerState,
    ControllerMeta.PK,
    CreateParams,
    UpdateParams
  >(ControllerMeta.MODEL, ControllerMeta.PK),
});

export const { actions } = controllerSlice;

export default controllerSlice.reducer;
