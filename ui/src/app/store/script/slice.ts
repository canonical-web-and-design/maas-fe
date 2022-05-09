import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import { ScriptMeta } from "./types";
import type { Script, ScriptState } from "./types";

import {
  generateCommonReducers,
  genericInitialState,
} from "app/store/utils/slice";

const scriptSlice = createSlice({
  initialState: genericInitialState as ScriptState,
  name: ScriptMeta.MODEL,
  reducers: {
    ...generateCommonReducers<ScriptState, ScriptMeta.PK, void, void>(
      ScriptMeta.MODEL,
      ScriptMeta.PK
    ),
    get: {
      prepare: (
        id: Script[ScriptMeta.PK],
        fileId: string,
        revision?: number
      ) => ({
        meta: {
          fileContextKey: fileId,
          method: "get_script",
          model: ScriptMeta.MODEL,
          useFileContext: true,
        },
        payload: {
          params: {
            id,
            ...(revision ? { revision } : {}),
          },
        },
      }),
      reducer: () => {
        // no state changes needed
      },
    },
    getError: (
      state: ScriptState,
      action: PayloadAction<ScriptState["errors"]>
    ) => {
      state.errors = action.payload;
      state.loading = false;
    },
    getStart: (state: ScriptState, _action: PayloadAction<null>) => {
      state.loading = true;
    },
    getSuccess: (state: ScriptState) => {
      state.loading = false;
    },
    upload: {
      prepare: (
        type: Script["script_type"],
        contents: string,
        name?: Script["name"] | null
      ) => ({
        payload: {
          contents,
          name,
          type,
        },
      }),
      reducer: () => {
        // no state changes needed
      },
    },
    uploadError: (
      state: ScriptState,
      action: PayloadAction<ScriptState["errors"]>
    ) => {
      state.errors = action.payload;
      state.saving = false;
    },
    uploadStart: (state: ScriptState) => {
      state.saving = true;
    },
    uploadSuccess: (state: ScriptState) => {
      state.saved = true;
    },
  },
});

export const { actions } = scriptSlice;

export default scriptSlice.reducer;
