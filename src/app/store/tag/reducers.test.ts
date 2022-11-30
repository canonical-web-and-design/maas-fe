import reducers, { actions } from "./slice";

import {
  tag as tagFactory,
  tagState as tagStateFactory,
} from "testing/factories";
import { tagStateListFactory } from "testing/factories/state";

describe("tag reducer", () => {
  it("returns the initial state", () => {
    expect(reducers(undefined, { type: "" })).toEqual({
      errors: null,
      items: [],
      lists: {},
      loaded: false,
      loading: false,
      saved: false,
      saving: false,
    });
  });

  it("reduces fetchStart", () => {
    expect(reducers(undefined, actions.fetchStart())).toEqual({
      errors: null,
      items: [],
      lists: {},
      loaded: false,
      loading: true,
      saved: false,
      saving: false,
    });
  });

  it("reduces fetchSuccess", () => {
    const state = tagStateFactory();
    const tags = [tagFactory()];

    expect(reducers(state, actions.fetchSuccess(tags))).toEqual({
      errors: null,
      items: tags,
      lists: {},
      loading: false,
      loaded: true,
      saved: false,
      saving: false,
    });
  });

  it("ignores calls that don't exist when reducing fetchSuccess", () => {
    const initialState = tagStateFactory({
      items: [],
      lists: {},
    });
    const fetchedTags = [
      tagFactory({ name: "tag1" }),
      tagFactory({ name: "tag2" }),
    ];

    expect(
      reducers(initialState, actions.fetchSuccess(fetchedTags, "123456"))
    ).toEqual(
      tagStateFactory({
        items: [],
        lists: {},
      })
    );
  });

  it("can handle fetchSuccess with callId", () => {
    const initialState = tagStateFactory({
      items: [],
      lists: { 123456: tagStateListFactory({ loading: true }) },
    });
    const fetchedTags = [
      tagFactory({ name: "tag1" }),
      tagFactory({ name: "tag2" }),
    ];

    expect(
      reducers(initialState, actions.fetchSuccess(fetchedTags, "123456"))
    ).toEqual(
      tagStateFactory({
        items: [],
        loaded: false,
        loading: false,
        lists: {
          123456: tagStateListFactory({
            loading: false,
            loaded: true,
            items: fetchedTags,
          }),
        },
      })
    );
  });

  it("can handle fetchSuccess without callId", () => {
    const initialState = tagStateFactory({
      items: [],
      loading: true,
      loaded: false,
      lists: {},
    });
    const fetchedTags = [
      tagFactory({ name: "tag1" }),
      tagFactory({ name: "tag2" }),
    ];

    expect(reducers(initialState, actions.fetchSuccess(fetchedTags))).toEqual(
      tagStateFactory({
        items: fetchedTags,
        loading: false,
        loaded: true,
        lists: {},
      })
    );
  });

  it("reduces fetchError", () => {
    const state = tagStateFactory();

    expect(reducers(state, actions.fetchError("Could not fetch tags"))).toEqual(
      {
        errors: "Could not fetch tags",
        items: [],
        lists: {},
        loaded: false,
        loading: false,
        saved: false,
        saving: false,
      }
    );
  });

  it("reduces removeRequest for a list request", () => {
    const initialState = tagStateFactory({
      lists: { "mock-call-id": tagStateListFactory() },
    });

    expect(
      reducers(initialState, actions.removeRequest("mock-call-id"))
    ).toEqual(
      tagStateFactory({
        lists: {},
      })
    );
  });

  describe("create reducers", () => {
    it("should correctly reduce createStart", () => {
      const initialState = tagStateFactory({ saving: false });
      expect(reducers(initialState, actions.createStart())).toEqual(
        tagStateFactory({
          saving: true,
        })
      );
    });

    it("should correctly reduce createError", () => {
      const initialState = tagStateFactory({ saving: true });
      expect(
        reducers(
          initialState,
          actions.createError({ key: "Key already exists" })
        )
      ).toEqual(
        tagStateFactory({
          errors: { key: "Key already exists" },
          saving: false,
        })
      );
    });

    it("should correctly reduce createSuccess", () => {
      const initialState = tagStateFactory({
        saved: false,
        saving: true,
      });
      expect(reducers(initialState, actions.createSuccess())).toEqual(
        tagStateFactory({
          saved: true,
          saving: false,
        })
      );
    });

    it("should correctly reduce createNotify", () => {
      const items = [tagFactory(), tagFactory()];
      const initialState = tagStateFactory({ items: [items[0]] });
      expect(reducers(initialState, actions.createNotify(items[1]))).toEqual(
        tagStateFactory({
          items,
        })
      );
    });
  });

  describe("update reducers", () => {
    it("reduces updateStart", () => {
      const tagState = tagStateFactory({ saved: true });

      expect(reducers(tagState, actions.updateStart())).toEqual({
        errors: null,
        items: [],
        lists: {},
        loaded: false,
        loading: false,
        saved: false,
        saving: true,
      });
    });

    it("reduces updateSuccess", () => {
      const tagState = tagStateFactory({
        saving: true,
      });

      expect(reducers(tagState, actions.updateSuccess())).toEqual({
        errors: null,
        items: [],
        lists: {},
        loaded: false,
        loading: false,
        saved: true,
        saving: false,
      });
    });

    it("reduces updateError", () => {
      const tagState = tagStateFactory({
        saving: true,
      });

      expect(
        reducers(tagState, actions.updateError("Could not update tag"))
      ).toEqual({
        errors: "Could not update tag",
        items: [],
        lists: {},
        loaded: false,
        loading: false,
        saved: false,
        saving: false,
      });
    });

    it("reduces updateNotify", () => {
      const tags = [tagFactory({ id: 1 })];
      const updatedTag = tagFactory({
        comment: "updated comment",
        definition: "updated def",
        id: 1,
        kernel_opts: "updated opts",
        name: "updated tag",
      });

      const tagState = tagStateFactory({
        items: tags,
      });

      expect(reducers(tagState, actions.updateNotify(updatedTag))).toEqual({
        errors: null,
        items: [updatedTag],
        lists: {},
        loaded: false,
        loading: false,
        saved: false,
        saving: false,
      });
    });
  });

  describe("delete reducers", () => {
    it("should correctly reduce deleteStart", () => {
      const initialState = tagStateFactory({
        saved: true,
        saving: false,
      });
      expect(reducers(initialState, actions.deleteStart())).toEqual(
        tagStateFactory({
          saved: false,
          saving: true,
        })
      );
    });

    it("should correctly reduce deleteError", () => {
      const initialState = tagStateFactory({
        errors: null,
        saving: true,
      });
      expect(
        reducers(initialState, actions.deleteError("Could not delete"))
      ).toEqual(
        tagStateFactory({
          errors: "Could not delete",
          saving: false,
        })
      );
    });

    it("should correctly reduce deleteSuccess", () => {
      const initialState = tagStateFactory({ saved: false });
      expect(reducers(initialState, actions.deleteSuccess())).toEqual(
        tagStateFactory({
          saved: true,
        })
      );
    });

    it("should correctly reduce deleteNotify", () => {
      const items = [tagFactory(), tagFactory()];
      const initialState = tagStateFactory({ items });
      expect(reducers(initialState, actions.deleteNotify(items[0].id))).toEqual(
        tagStateFactory({
          items: [items[1]],
        })
      );
    });
  });
});
