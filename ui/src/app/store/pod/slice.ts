import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";

import type { Pod, PodProject, PodState, PodType } from "./types";

import { generateStatusHandlers } from "app/store/utils";
import type { GenericItemMeta } from "app/store/utils";
import {
  generateCommonReducers,
  genericInitialState,
} from "app/store/utils/slice";

export const DEFAULT_STATUSES = {
  composing: false,
  deleting: false,
  refreshing: false,
};

type GetProjectsMeta = {
  password?: string;
  power_address: string;
  type: PodType;
};

type UpdatePod = Partial<Omit<Pod, "tags"> & { tags: string }>;

const statusHandlers = generateStatusHandlers<PodState, Pod, "id">(
  "pod",
  "id",
  [
    {
      status: "compose",
      statusKey: "composing",
      prepare: (id) => id,
    },
    {
      status: "delete",
      statusKey: "deleting",
      prepare: ({
        decompose = false,
        id,
      }: {
        decompose?: boolean;
        id: Pod["id"];
      }) => ({ decompose, id }),
    },
    {
      status: "refresh",
      statusKey: "refreshing",
      prepare: (id) => ({ id }),
      success: (state, action) => {
        for (const i in state.items) {
          if (state.items[i].id === action.payload.id) {
            state.items[i] = action.payload;
            return;
          }
        }
      },
    },
  ]
);

const podSlice = createSlice({
  name: "pod",
  initialState: {
    ...genericInitialState,
    active: null,
    projects: {},
    statuses: {},
  } as PodState,
  reducers: {
    ...generateCommonReducers<PodState, "id">("pod", "id"),
    // Explicitly assign generated status handlers so that the dynamically
    // generated names exist on the reducers object.
    refresh: statusHandlers.refresh,
    refreshStart: statusHandlers.refreshStart,
    refreshSuccess: statusHandlers.refreshSuccess,
    refreshError: statusHandlers.refreshError,
    delete: statusHandlers.delete,
    deleteStart: statusHandlers.deleteStart,
    deleteSuccess: statusHandlers.deleteSuccess,
    deleteError: statusHandlers.deleteError,
    compose: statusHandlers.compose,
    composeStart: statusHandlers.composeStart,
    composeSuccess: statusHandlers.composeSuccess,
    composeError: statusHandlers.composeError,
    fetchSuccess: (state: PodState, action: PayloadAction<Pod[]>) => {
      state.loading = false;
      state.loaded = true;
      action.payload.forEach((newItem: Pod) => {
        // If the item already exists, update it, otherwise
        // add it to the store.
        const existingIdx = state.items.findIndex(
          (draftItem: Pod) => draftItem.id === newItem.id
        );
        if (existingIdx !== -1) {
          state.items[existingIdx] = newItem;
        } else {
          state.items.push(newItem);
          // Set up the statuses for this machine.
          state.statuses[newItem.id] = DEFAULT_STATUSES;
        }
      });
    },
    get: {
      prepare: (podID: Pod["id"]) => ({
        meta: {
          model: "pod",
          method: "get",
        },
        payload: {
          params: { id: podID },
        },
      }),
      reducer: () => {
        // No state changes need to be handled for this action.
      },
    },
    getStart: (state: PodState) => {
      state.loading = true;
    },
    getError: (state: PodState, action: PayloadAction<PodState["errors"]>) => {
      state.errors = action.payload;
      state.loading = false;
      state.saving = false;
    },
    getSuccess: (state: PodState, action: PayloadAction<Pod>) => {
      const pod = action.payload;
      // If the item already exists, update it, otherwise
      // add it to the store.
      const i = state.items.findIndex(
        (draftItem: Pod) => draftItem.id === pod.id
      );
      if (i !== -1) {
        state.items[i] = pod;
      } else {
        state.items.push(pod);
        // Set up the statuses for this pod.
        state.statuses[pod.id] = DEFAULT_STATUSES;
      }
      state.loading = false;
    },
    getProjects: {
      prepare: (params: {
        type: PodType;
        power_address: string;
        password?: string;
      }) => ({
        meta: {
          model: "pod",
          method: "get_projects",
        },
        payload: {
          params,
        },
      }),
      reducer: () => {
        // No state changes need to be handled for this action.
      },
    },
    getProjectsSuccess: {
      prepare: (
        item: {
          type: PodType;
          power_address: string;
          password?: string;
        },
        payload: PodProject[]
      ) => ({
        meta: {
          item,
        },
        payload,
      }),
      reducer: (
        state: PodState,
        action: PayloadAction<
          PodProject[],
          string,
          GenericItemMeta<GetProjectsMeta>
        >
      ) => {
        const address = action.meta.item.power_address;
        if (address) {
          state.projects[address] = action.payload;
        }
      },
    },
    getProjectsError: (
      state: PodState,
      action: PayloadAction<PodState["errors"]>
    ) => {
      state.errors = action.payload;
    },
    setActive: {
      prepare: (id: Pod["id"] | null) => ({
        meta: {
          model: "pod",
          method: "set_active",
        },
        payload: {
          // Server unsets active pod if primary key (id) is not sent.
          params: id === null ? null : { id },
        },
      }),
      reducer: () => {
        // No state changes need to be handled for this action.
      },
    },
    setActiveError: (
      state: PodState,
      action: PayloadAction<PodState["errors"]>
    ) => {
      state.active = null;
      state.errors = action.payload;
    },
    setActiveSuccess: (state: PodState, action: PayloadAction<Pod | null>) => {
      state.active = action.payload?.id || null;
    },
    createNotify: (state: PodState, action) => {
      // In the event that the server erroneously attempts to create an existing machine,
      // due to a race condition etc., ensure we update instead of creating duplicates.
      const existingIdx = state.items.findIndex(
        (draftItem: Pod) => draftItem.id === action.payload.id
      );
      if (existingIdx !== -1) {
        state.items[existingIdx] = action.payload;
      } else {
        state.items.push(action.payload);
        state.statuses[action.payload.id] = DEFAULT_STATUSES;
      }
    },
    deleteNotify: (state: PodState, action) => {
      const index = state.items.findIndex(
        (item: Pod) => item.id === action.payload
      );
      state.items.splice(index, 1);
      // Clean up the statuses for model.
      delete state.statuses[action.payload];
    },
    update: {
      prepare: (params: UpdatePod) => ({
        meta: {
          model: "pod",
          method: "update",
        },
        payload: {
          params,
        },
      }),
      reducer: () => {
        // No state changes need to be handled for this action.
      },
    },
  },
});

export const { actions } = podSlice;

export default podSlice.reducer;
