import {
  scripts as scriptsFactory,
  scriptsState as scriptsStateFactory,
} from "testing/factories";
import scripts from "./selectors";

describe("scripts selectors", () => {
  describe("all", () => {
    it("returns all scripts", () => {
      const items = [scriptsFactory(), scriptsFactory()];
      const state = {
        scripts: scriptsStateFactory({
          items,
        }),
      };

      expect(scripts.all(state)).toStrictEqual(items);
    });
  });

  describe("loading", () => {
    it("returns scripts loading state", () => {
      const state: TSFixMe = {
        scripts: {
          loading: true,
          loaded: false,
          items: [],
        },
      };
      expect(scripts.loading(state)).toStrictEqual(true);
    });
  });

  describe("loaded", () => {
    it("returns scripts loaded state", () => {
      const state: TSFixMe = {
        scripts: {
          loading: false,
          loaded: true,
          items: [],
        },
      };
      expect(scripts.loaded(state)).toStrictEqual(true);
    });
  });

  describe("commissioning", () => {
    it("returns all commissioning scripts", () => {
      const items = [
        {
          name: "commissioning script",
          description: "a commissioning script",
          type: 0,
        },
        {
          name: "testing script",
          description: "a testing script",
          type: 2,
        },
        {
          name: "commissioning script two",
          description: "another commissioning script",
          type: 0,
        },
      ];
      const state: TSFixMe = {
        scripts: {
          loading: false,
          loaded: true,
          items,
        },
      };

      expect(scripts.commissioning(state)).toEqual([
        {
          name: "commissioning script",
          description: "a commissioning script",
          type: 0,
        },
        {
          name: "commissioning script two",
          description: "another commissioning script",
          type: 0,
        },
      ]);
    });
  });

  describe("testing", () => {
    it("returns all testing scripts", () => {
      const items = [
        {
          name: "commissioning script",
          description: "a commissioning script",
          type: 0,
        },
        {
          name: "testing script",
          description: "a testing script",
          type: 2,
        },
        {
          name: "testing script two",
          description: "another testing script",
          type: 2,
        },
      ];
      const state: TSFixMe = {
        scripts: {
          loading: false,
          loaded: true,
          items,
        },
      };

      expect(scripts.testing(state)).toEqual([
        {
          name: "testing script",
          description: "a testing script",
          type: 2,
        },
        {
          name: "testing script two",
          description: "another testing script",
          type: 2,
        },
      ]);
    });
  });

  describe("testingWithUrl", () => {
    it("returns testing scripts that contain a url parameter", () => {
      const items = [
        {
          name: "commissioning script",
          description: "a commissioning script",
          parameters: {},
          type: 0,
        },
        {
          name: "testing script",
          description: "a testing script",
          parameters: {},
          type: 2,
        },
        {
          name: "testing script with url",
          description: "this is the right testing script",
          parameters: {
            url: {
              default: "www.website.come",
              description: "url description",
            },
          },
          type: 2,
        },
      ];
      const state: TSFixMe = {
        scripts: {
          loading: false,
          loaded: true,
          items,
        },
      };

      expect(scripts.testingWithUrl(state)).toEqual([
        {
          name: "testing script with url",
          description: "this is the right testing script",
          parameters: {
            url: {
              default: "www.website.come",
              description: "url description",
            },
          },
          type: 2,
        },
      ]);
    });
  });
});
