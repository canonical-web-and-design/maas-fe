import { createSlice } from "@reduxjs/toolkit";

import { FabricMeta } from "./types";
import type { CreateParams, FabricState, UpdateParams } from "./types";

import {
  generateCommonReducers,
  genericInitialState,
} from "app/store/utils/slice";

const fabricSlice = createSlice({
  name: FabricMeta.MODEL,
  initialState: genericInitialState as FabricState,
  reducers: generateCommonReducers<
    FabricState,
    FabricMeta.PK,
    CreateParams,
    UpdateParams
  >(FabricMeta.MODEL, FabricMeta.PK),
});

export const { actions } = fabricSlice;

export default fabricSlice.reducer;
