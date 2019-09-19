import architectures from "./architectures";

describe("architectures selectors", () => {
  describe("get", () => {
    it("returns architectures", () => {
      const data = ["amd64/generic"];
      const state = {
        general: {
          architectures: {
            data,
            errors: {},
            loaded: true,
            loading: false
          }
        }
      };
      expect(architectures.get(state)).toStrictEqual(data);
    });
  });

  describe("loading", () => {
    it("returns architectures loading state", () => {
      const loading = true;
      const state = {
        general: {
          architectures: {
            data: [],
            errors: {},
            loaded: false,
            loading
          }
        }
      };
      expect(architectures.loading(state)).toStrictEqual(loading);
    });
  });

  describe("loaded", () => {
    it("returns architectures loaded state", () => {
      const loaded = true;
      const state = {
        general: {
          architectures: {
            data: [],
            errors: {},
            loaded,
            loading: false
          }
        }
      };
      expect(architectures.loaded(state)).toStrictEqual(loaded);
    });
  });

  describe("errors", () => {
    it("returns architectures errors state", () => {
      const errors = "Cannot fetch architectures.";
      const state = {
        general: {
          architectures: {
            data: [],
            errors,
            loaded: true,
            loading: false
          }
        }
      };
      expect(architectures.errors(state)).toStrictEqual(errors);
    });
  });
});
