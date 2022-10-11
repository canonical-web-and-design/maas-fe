import tag, { TagSearchFilter } from "./selectors";

import {
  rootState as rootStateFactory,
  tag as tagFactory,
  tagState as tagStateFactory,
} from "testing/factories";
import { tagStateListFactory } from "testing/factories/state";

describe("tag selectors", () => {
  it("can get all items", () => {
    const items = [tagFactory(), tagFactory()];
    const state = rootStateFactory({
      tag: tagStateFactory({
        items,
      }),
    });
    expect(tag.all(state)).toEqual(items);
  });

  it("can get items in a list", () => {
    const items = [tagFactory(), tagFactory()];
    const state = rootStateFactory({
      tag: tagStateFactory({
        lists: {
          "mock-call-id": tagStateListFactory({
            items,
          }),
        },
      }),
    });
    expect(tag.list(state, "mock-call-id")).toStrictEqual(items);
  });

  it("can get the loading state for a list", () => {
    const items = [tagFactory(), tagFactory()];
    const state = rootStateFactory({
      tag: tagStateFactory({
        lists: {
          "mock-call-id": tagStateListFactory({
            items,
            loading: true,
            loaded: false,
          }),
        },
      }),
    });
    expect(tag.listLoading(state, "mock-call-id")).toBe(true);
  });

  it("can get the loaded state for a list", () => {
    const items = [tagFactory(), tagFactory()];
    const state = rootStateFactory({
      tag: tagStateFactory({
        lists: {
          "mock-call-id": tagStateListFactory({
            items,
            loaded: true,
            loading: false,
          }),
        },
      }),
    });
    expect(tag.listLoaded(state, "mock-call-id")).toBe(true);
  });

  it("can get all manual tags", () => {
    const items = [
      tagFactory({ definition: "def1" }),
      tagFactory({ definition: "" }),
    ];
    const state = rootStateFactory({
      tag: tagStateFactory({
        items,
      }),
    });
    expect(tag.getManual(state)).toEqual([items[1]]);
  });

  it("can get the loading state", () => {
    const state = rootStateFactory({
      tag: tagStateFactory({
        loading: true,
      }),
    });
    expect(tag.loading(state)).toEqual(true);
  });

  it("can get the loaded state", () => {
    const state = rootStateFactory({
      tag: tagStateFactory({
        loaded: true,
      }),
    });
    expect(tag.loaded(state)).toEqual(true);
  });

  it("can get the errors state", () => {
    const state = rootStateFactory({
      tag: tagStateFactory({
        errors: "Data is incorrect",
      }),
    });
    expect(tag.errors(state)).toStrictEqual("Data is incorrect");
  });

  it("can get all automatic tags", () => {
    const items = [
      tagFactory({ definition: "def1" }),
      tagFactory({ definition: "" }),
    ];
    const state = rootStateFactory({
      tag: tagStateFactory({
        items,
      }),
    });
    expect(tag.getAutomatic(state)).toStrictEqual([items[0]]);
  });

  describe("getByIDs", () => {
    const tags = [
      tagFactory({ id: 1 }),
      tagFactory({ id: 2 }),
      tagFactory({ id: 3 }),
    ];

    it("handles the null case", () => {
      const state = rootStateFactory({
        tag: tagStateFactory({ items: tags }),
      });
      expect(tag.getByIDs(state, null)).toStrictEqual([]);
    });

    it("returns a list of tags given their IDs", () => {
      const state = rootStateFactory({
        tag: tagStateFactory({ items: tags }),
      });
      expect(tag.getByIDs(state, [1, 2])).toStrictEqual([tags[0], tags[1]]);
    });
  });

  describe("getByName", () => {
    const tags = [
      tagFactory({ name: "tag1" }),
      tagFactory({ name: "tag2" }),
      tagFactory({ name: "tag3" }),
    ];

    it("handles the null case", () => {
      const state = rootStateFactory({
        tag: tagStateFactory({ items: tags }),
      });
      expect(tag.getByName(state, null)).toBe(null);
    });

    it("returns a list of tags given their IDs", () => {
      const state = rootStateFactory({
        tag: tagStateFactory({ items: tags }),
      });
      expect(tag.getByName(state, "tag2")).toStrictEqual(tags[1]);
    });
  });

  describe("getAutomaticByIDs", () => {
    const tags = [
      tagFactory({ id: 1 }),
      tagFactory({ definition: "def1", id: 2 }),
      tagFactory({ id: 3 }),
    ];
    const state = rootStateFactory({
      tag: tagStateFactory({ items: tags }),
    });

    it("handles the null case", () => {
      expect(tag.getAutomaticByIDs(state, null)).toStrictEqual([]);
    });

    it("returns a list of tags given their IDs", () => {
      expect(tag.getAutomaticByIDs(state, [1, 2])).toStrictEqual([tags[1]]);
    });
  });

  describe("getManualByIDs", () => {
    const tags = [
      tagFactory({ id: 1 }),
      tagFactory({ definition: "def1", id: 2 }),
      tagFactory({ id: 3 }),
    ];
    const state = rootStateFactory({
      tag: tagStateFactory({ items: tags }),
    });

    it("handles the null case", () => {
      expect(tag.getManualByIDs(state, null)).toStrictEqual([]);
    });

    it("returns a list of tags given their IDs", () => {
      expect(tag.getManualByIDs(state, [1, 2])).toStrictEqual([tags[0]]);
    });
  });

  describe("search", () => {
    const tags = [
      tagFactory({ id: 1, definition: undefined, name: "jacket" }),
      tagFactory({ id: 2, definition: "denim", name: "jeans" }),
      tagFactory({ id: 3, definition: undefined, name: "shirt" }),
    ];

    it("returns all tags if no filters or search are provided", () => {
      const state = rootStateFactory({
        tag: tagStateFactory({ items: tags }),
      });
      expect(tag.search(state, null, null)).toStrictEqual(tags);
    });

    it("returns all tags if the filter is set to 'All'", () => {
      const state = rootStateFactory({
        tag: tagStateFactory({ items: tags }),
      });
      expect(tag.search(state, null, TagSearchFilter.All)).toStrictEqual(tags);
    });

    it("filters automatic tags", () => {
      const state = rootStateFactory({
        tag: tagStateFactory({ items: tags }),
      });
      expect(tag.search(state, null, TagSearchFilter.Auto)).toStrictEqual([
        tags[1],
      ]);
    });

    it("filters manual tags", () => {
      const state = rootStateFactory({
        tag: tagStateFactory({ items: tags }),
      });
      expect(tag.search(state, null, TagSearchFilter.Manual)).toStrictEqual([
        tags[0],
        tags[2],
      ]);
    });

    it("searches tags", () => {
      const state = rootStateFactory({
        tag: tagStateFactory({ items: tags }),
      });
      expect(tag.search(state, "j", null)).toStrictEqual([tags[0], tags[1]]);
    });

    it("searches and filters tags", () => {
      const state = rootStateFactory({
        tag: tagStateFactory({ items: tags }),
      });
      expect(tag.search(state, "j", TagSearchFilter.Manual)).toStrictEqual([
        tags[0],
      ]);
    });
  });
});
