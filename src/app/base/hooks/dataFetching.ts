import { useEffect, useMemo } from "react";

import { useDispatch, useSelector } from "react-redux";
import type { AnyAction } from "redux";

import statusSelectors from "@/app/store/status/selectors";

/**
 * A hook to run a set of actions once on mount and again when the websocket
 * reconnects.
 * @param {Array<() => AnyAction>} actions - The actions to run.
 */
export const useFetchActions = (actions: (() => AnyAction)[]) => {
  const dispatch = useDispatch();
  const connectedCount = useSelector(statusSelectors.connectedCount);

  const memoActions = useMemo(() => actions, [actions]);

  useEffect(() => {
    memoActions.forEach((action) => {
      dispatch(action());
    });
  }, [memoActions, dispatch, connectedCount]);
};
