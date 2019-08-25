import users from "./users";

describe("user actions", () => {
  it("should handle fetching users", () => {
    expect(users.fetch()).toEqual({
      type: "FETCH_USER",
      meta: {
        model: "user",
        method: "list"
      }
    });
  });

  it("can handle creating users", () => {
    expect(users.create({ name: "kangaroo" })).toEqual({
      type: "CREATE_USER",
      meta: {
        model: "user",
        method: "create"
      },
      payload: {
        params: {
          name: "kangaroo"
        }
      }
    });
  });

  it("can handle updating users", () => {
    expect(users.update({ name: "kookaburra" })).toEqual({
      type: "UPDATE_USER",
      meta: {
        model: "user",
        method: "update"
      },
      payload: {
        params: {
          name: "kookaburra"
        }
      }
    });
  });

  it("can handle deleting users", () => {
    expect(users.delete(808)).toEqual({
      type: "DELETE_USER",
      meta: {
        model: "user",
        method: "delete"
      },
      payload: {
        params: {
          id: 808
        }
      }
    });
  });

  it("can handle cleaning users", () => {
    expect(users.cleanup({ name: "kookaburra" })).toEqual({
      type: "CLEANUP_USER"
    });
  });
});
