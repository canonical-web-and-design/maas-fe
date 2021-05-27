import reducers, { actions } from "./slice";
import { ScriptResultDataType } from "./types";

import {
  partialScriptResult as partialScriptResultFactory,
  scriptResult as scriptResultFactory,
  scriptResultState as scriptResultStateFactory,
} from "testing/factories";

describe("script result reducer", () => {
  it("returns the initial state", () => {
    expect(reducers(undefined, { type: "" })).toEqual({
      errors: null,
      items: [],
      loaded: false,
      loading: false,
      saved: false,
      saving: false,
      history: {},
      logs: null,
    });
  });

  describe("get", () => {
    it("reduces getStart", () => {
      const scriptResultState = scriptResultStateFactory({
        items: [],
        loading: false,
      });
      expect(reducers(scriptResultState, actions.getStart(null))).toEqual(
        scriptResultStateFactory({ loading: true })
      );
    });

    it("reduces getSuccess", () => {
      const existingScriptResult = scriptResultFactory();
      const newScriptResult = scriptResultFactory({ id: 2 });
      const scriptResultState = scriptResultStateFactory({
        items: [existingScriptResult],
        loading: true,
      });
      expect(
        reducers(scriptResultState, actions.getSuccess(newScriptResult))
      ).toEqual(
        scriptResultStateFactory({
          items: [existingScriptResult, newScriptResult],
          loading: false,
          history: { 2: [] },
        })
      );
    });

    it("reduces getError", () => {
      const scriptResultState = scriptResultStateFactory({ loading: true });
      expect(
        reducers(
          scriptResultState,
          actions.getError("Could not get script result")
        )
      ).toEqual(
        scriptResultStateFactory({
          errors: "Could not get script result",
          loading: false,
        })
      );
    });
  });

  it("reduces getByMachineIdStart", () => {
    const scriptResultState = scriptResultStateFactory({
      items: [],
      loading: false,
    });

    expect(
      reducers(scriptResultState, actions.getByMachineIdStart(null))
    ).toEqual(scriptResultStateFactory({ loading: true }));
  });

  it("reduces getByMachineIdSuccess", () => {
    const existingScriptResult = scriptResultFactory({ id: 1 });
    const newScriptResult = scriptResultFactory({ id: 2 });
    const newScriptResult2 = scriptResultFactory({ id: 3 });

    const scriptResultState = scriptResultStateFactory({
      items: [existingScriptResult],
      loading: true,
    });

    expect(
      reducers(
        scriptResultState,
        actions.getByMachineIdSuccess([newScriptResult, newScriptResult2])
      )
    ).toEqual(
      scriptResultStateFactory({
        items: [existingScriptResult, newScriptResult, newScriptResult2],
        loading: false,
        loaded: true,
        history: { 2: [], 3: [] },
      })
    );
  });

  it("reduces getError", () => {
    const scriptResultState = scriptResultStateFactory({ loading: true });

    expect(
      reducers(
        scriptResultState,
        actions.getByMachineIdError("Could not get script result")
      )
    ).toEqual(
      scriptResultStateFactory({
        errors: "Could not get script result",
        loading: false,
      })
    );
  });

  it("reduces createNotify", () => {
    const scriptResultState = scriptResultStateFactory({
      items: [],
    });
    const newScriptResult = scriptResultFactory({ id: 1 });

    expect(
      reducers(scriptResultState, {
        type: "noderesult/createNotify",
        payload: newScriptResult,
      })
    ).toEqual(
      scriptResultStateFactory({
        items: [newScriptResult],
      })
    );
  });

  it("reduces createNotify for a script result that already exists", () => {
    const scriptResultState = scriptResultStateFactory({
      items: [scriptResultFactory({ id: 1 })],
    });
    const newScriptResult = scriptResultFactory({ id: 1 });

    expect(
      reducers(scriptResultState, {
        type: "noderesult/createNotify",
        payload: newScriptResult,
      })
    ).toEqual(
      scriptResultStateFactory({
        items: [newScriptResult],
      })
    );
  });

  it("reduce updateNotify for noderesult", () => {
    const scriptResultState = scriptResultStateFactory({
      items: [scriptResultFactory({ id: 1 })],
    });
    const updatedScriptResult = scriptResultFactory({ id: 1 });

    expect(
      reducers(scriptResultState, {
        type: "noderesult/updateNotify",
        payload: updatedScriptResult,
      })
    ).toEqual(
      scriptResultStateFactory({
        items: [updatedScriptResult],
      })
    );
  });

  it("reduces updateNotify for a script result that doesn't exist", () => {
    const scriptResultState = scriptResultStateFactory({
      items: [],
    });
    const updatedScriptResult = scriptResultFactory({ id: 1 });

    expect(
      reducers(scriptResultState, {
        type: "noderesult/updateNotify",
        payload: updatedScriptResult,
      })
    ).toEqual(
      scriptResultStateFactory({
        items: [updatedScriptResult],
      })
    );
  });

  it("reduces getHistoryStart", () => {
    const scriptResultState = scriptResultStateFactory({
      items: [],
      loading: false,
      history: {},
    });

    expect(reducers(scriptResultState, actions.getHistoryStart(null))).toEqual(
      scriptResultStateFactory({ loading: true })
    );
  });

  it("reduces getHistorySuccess", () => {
    const scriptResult = scriptResultFactory({ id: 123 });
    const partialScriptResult = partialScriptResultFactory({
      id: scriptResult.id,
    });

    const scriptResultState = scriptResultStateFactory({
      items: [scriptResult],
      loading: true,
      history: { 123: [] },
    });

    expect(
      reducers(
        scriptResultState,
        actions.getHistorySuccess(123, [partialScriptResult])
      )
    ).toEqual(
      scriptResultStateFactory({
        items: [scriptResult],
        loading: false,
        loaded: true,
        history: { 123: [partialScriptResult] },
      })
    );
  });

  it("reduces getLogsStart", () => {
    const scriptResultState = scriptResultStateFactory({
      items: [],
      loading: false,
      history: {},
      logs: null,
    });

    expect(reducers(scriptResultState, actions.getLogsStart(null))).toEqual(
      scriptResultStateFactory({ loading: true })
    );
  });

  it("reduces getLogsSuccess", () => {
    const scriptResult = scriptResultFactory({ id: 123 });

    const scriptResultState = scriptResultStateFactory({
      items: [scriptResult],
      loading: true,
      logs: null,
    });

    expect(
      reducers(
        scriptResultState,
        actions.getLogsSuccess(123, ScriptResultDataType.COMBINED, "foo")
      )
    ).toEqual(
      scriptResultStateFactory({
        items: [scriptResult],
        loading: false,
        loaded: true,
        logs: { 123: { combined: "foo" } },
      })
    );
  });

  it("reduces getLogsSuccess with additional logs", () => {
    const scriptResult = scriptResultFactory({ id: 123 });

    const scriptResultState = scriptResultStateFactory({
      items: [scriptResult],
      loading: true,
      logs: { 123: { combined: "foo" } },
    });

    expect(
      reducers(
        scriptResultState,
        actions.getLogsSuccess(123, ScriptResultDataType.RESULT, "bar")
      )
    ).toEqual(
      scriptResultStateFactory({
        items: [scriptResult],
        loading: false,
        loaded: true,
        logs: { 123: { combined: "foo", result: "bar" } },
      })
    );
  });
});
