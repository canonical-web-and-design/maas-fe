import { createSlice } from "@reduxjs/toolkit";

import { TokenMeta } from "./types";
import type { CreateParams, TokenState, UpdateParams } from "./types";

import {
  generateCommonReducers,
  genericInitialState,
} from "app/store/utils/slice";

const tokenSlice = createSlice({
  initialState: genericInitialState as TokenState,
  name: TokenMeta.MODEL,
  reducers: generateCommonReducers<
    TokenState,
    TokenMeta.PK,
    CreateParams,
    UpdateParams
  >(TokenMeta.MODEL, TokenMeta.PK),
});

export const { actions } = tokenSlice;

export default tokenSlice.reducer;
