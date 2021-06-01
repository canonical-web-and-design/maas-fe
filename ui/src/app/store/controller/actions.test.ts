import { actions } from "./slice";

describe("controller actions", () => {
  it("returns a fetch action", () => {
    expect(actions.fetch()).toEqual({
      type: "controller/fetch",
      meta: {
        model: "controller",
        method: "list",
      },
      payload: null,
    });
  });

  it("returns a create action", () => {
    expect(actions.create({ description: "a controller" })).toEqual({
      type: "controller/create",
      meta: {
        model: "controller",
        method: "create",
      },
      payload: {
        params: {
          description: "a controller",
        },
      },
    });
  });

  it("returns an update action", () => {
    expect(
      actions.update({ system_id: "abc123", description: "a controller" })
    ).toEqual({
      type: "controller/update",
      meta: {
        model: "controller",
        method: "update",
      },
      payload: {
        params: {
          description: "a controller",
          system_id: "abc123",
        },
      },
    });
  });

  it("returns a delete action", () => {
    expect(actions.delete("abc123")).toEqual({
      type: "controller/delete",
      meta: {
        model: "controller",
        method: "delete",
      },
      payload: {
        params: {
          id: "abc123",
        },
      },
    });
  });

  it("returns a cleanup action", () => {
    expect(actions.cleanup()).toEqual({
      type: "controller/cleanup",
      payload: undefined,
    });
  });
});
