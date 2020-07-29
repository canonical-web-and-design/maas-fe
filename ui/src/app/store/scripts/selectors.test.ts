import {
  scripts as scriptsFactory,
  scriptsState as scriptsStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";
import scripts from "./selectors";

describe("scripts selectors", () => {
  describe("all", () => {
    it("returns all scripts", () => {
      const items = [scriptsFactory(), scriptsFactory()];
      const state = rootStateFactory({
        scripts: scriptsStateFactory({
          items,
        }),
      });

      expect(scripts.all(state)).toStrictEqual(items);
    });
  });

  describe("loading", () => {
    it("returns scripts loading state", () => {
      const state = rootStateFactory({
        scripts: scriptsStateFactory({
          loading: true,
        }),
      });
      expect(scripts.loading(state)).toStrictEqual(true);
    });
  });

  describe("loaded", () => {
    it("returns scripts loaded state", () => {
      const state = rootStateFactory({
        scripts: scriptsStateFactory({
          loaded: true,
        }),
      });
      expect(scripts.loaded(state)).toStrictEqual(true);
    });
  });

  describe("commissioning", () => {
    it("returns all commissioning scripts", () => {
      const items = [
        scriptsFactory({ type: 0 }),
        scriptsFactory({ type: 2 }),
        scriptsFactory({ type: 0 }),
      ];
      const state = rootStateFactory({
        scripts: scriptsStateFactory({
          items,
        }),
      });

      expect(scripts.commissioning(state)).toEqual([items[0], items[2]]);
    });
  });

  describe("testing", () => {
    it("returns all testing scripts", () => {
      const items = [
        scriptsFactory({ type: 0 }),
        scriptsFactory({ type: 2 }),
        scriptsFactory({ type: 2 }),
      ];
      const state = rootStateFactory({
        scripts: scriptsStateFactory({
          items,
        }),
      });

      expect(scripts.testing(state)).toEqual([items[1], items[2]]);
    });
  });

  describe("testingWithUrl", () => {
    it("returns testing scripts that contain a url parameter", () => {
      const items = [
        scriptsFactory(),
        scriptsFactory(),
        scriptsFactory({
          parameters: {
            url: {
              default: "www.website.come",
              description: "url description",
            },
          },
          type: 2,
        }),
      ];
      const state = rootStateFactory({
        scripts: scriptsStateFactory({
          items,
        }),
      });

      expect(scripts.testingWithUrl(state)).toEqual([items[2]]);
    });
  });
});
