import {
  extractPowerType,
  generateBaseURL,
  generateLegacyURL,
  generateNewURL,
  navigateToLegacy,
  navigateToNew,
} from "./utils";

describe("utils", () => {
  let pushState: jest.SpyInstance;

  beforeEach(() => {
    pushState = jest.spyOn(window.history, "pushState");
  });

  afterEach(() => {
    pushState.mockRestore();
  });

  describe("generateBaseURL", () => {
    it("can generate base urls", () => {
      expect(generateBaseURL("/api")).toBe("/MAAS/api");
    });

    it("can generate base urls without a route", () => {
      expect(generateBaseURL()).toBe("/MAAS");
    });
  });

  describe("generateLegacyURL", () => {
    it("can generate legacy urls", () => {
      expect(generateLegacyURL("/subnets")).toBe("/MAAS/l/subnets");
    });

    it("can generate base legacy urls", () => {
      expect(generateLegacyURL()).toBe("/MAAS/l");
    });
  });

  describe("generateNewURL", () => {
    it("can generate react urls", () => {
      expect(generateNewURL("/machines")).toBe("/MAAS/machines");
    });

    it("can generate base react urls", () => {
      expect(generateNewURL()).toBe("/MAAS");
    });

    it("can generate react urls without a base", () => {
      expect(generateNewURL("/machines", false)).toBe("/machines");
    });
  });

  describe("navigateToLegacy", () => {
    it("can navigate to legacy routes", () => {
      navigateToLegacy("/subnets");
      expect(pushState).toHaveBeenCalledWith(null, null, "/MAAS/l/subnets");
    });
  });

  describe("navigateToNew", () => {
    it("can navigate to react routes", () => {
      navigateToNew("/machines");
      expect(pushState).toHaveBeenCalledWith(null, null, "/MAAS/machines");
    });

    it("can navigate to react routes", () => {
      navigateToNew("/machines");
      expect(pushState).toHaveBeenCalledWith(null, null, "/MAAS/machines");
    });

    it("prevents default if this is a normal click", () => {
      const preventDefault = jest.fn();
      const mouseEvent = new MouseEvent("click", { button: 0 });
      mouseEvent.preventDefault = preventDefault;
      navigateToNew("/machines", mouseEvent);
      expect(pushState).toHaveBeenCalledWith(null, null, "/MAAS/machines");
      expect(preventDefault).toHaveBeenCalled();
    });

    it("does not navigate if this not a left click", () => {
      const preventDefault = jest.fn();
      const mouseEvent: MouseEvent = new MouseEvent("click", { button: 1 });
      mouseEvent.preventDefault = preventDefault;
      navigateToNew("/machines", mouseEvent);
      expect(pushState).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });

    it("does not navigate if a modifier key is pressed", () => {
      const preventDefault = jest.fn();
      const mouseEvent: MouseEvent = new MouseEvent("click", {
        button: 0,
        metaKey: true,
      });
      mouseEvent.preventDefault = preventDefault;
      navigateToNew("/machines", mouseEvent);
      expect(pushState).not.toHaveBeenCalled();
      expect(preventDefault).not.toHaveBeenCalled();
    });
  });

  describe("extractPowerType", () => {
    it("can extract a power type from a description", () => {
      expect(extractPowerType("The OpenBMC Power Driver", "openbmc")).toBe(
        "OpenBMC"
      );
    });

    it("handles no matching power type", () => {
      expect(extractPowerType("Open BMC Power Driver", "openbmc")).toBe(
        "openbmc"
      );
    });

    it("handles no description", () => {
      expect(extractPowerType(null, "openbmc")).toBe("openbmc");
    });
  });
});
