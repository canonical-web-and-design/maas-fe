import { act, renderHook } from "@testing-library/react-hooks";

import {
  useCycled,
  useId,
  usePreviousPersistent,
  useProcessing,
  useScrollOnRender,
  useScrollToTop,
} from "./base";

const mockUseLocationValue = {
  pathname: "/original-pathname",
  search: "",
  hash: "",
  state: null,
};
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLocation: () => mockUseLocationValue,
}));

describe("hooks", () => {
  describe("useScrollOnRender", () => {
    let html: HTMLHtmlElement | null;
    let scrollToSpy: jest.Mock;
    let targetNode: HTMLElement;

    beforeEach(() => {
      global.innerHeight = 500;
      // eslint-disable-next-line testing-library/no-node-access
      html = document.querySelector("html");
      scrollToSpy = jest.fn();
      global.scrollTo = scrollToSpy;
      targetNode = document.createElement("div");
    });

    afterEach(() => {
      if (html) {
        html.scrollTop = 0;
      }
    });

    it("does not scroll if the target is on screen", () => {
      if (html) {
        html.scrollTop = 10;
      }
      const { result } = renderHook(() => useScrollOnRender());
      targetNode.getBoundingClientRect = () => ({ y: 10 } as DOMRect);
      result.current(targetNode);
      expect(scrollToSpy).not.toHaveBeenCalled();
    });

    it("scrolls if the target is off the bottom of the screen", () => {
      if (html) {
        html.scrollTop = 100;
      }
      const { result } = renderHook(() => useScrollOnRender());
      targetNode.getBoundingClientRect = () => ({ y: 1000 } as DOMRect);
      result.current(targetNode);
      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 1000,
        left: 0,
        behavior: "smooth",
      });
    });

    it("scrolls if the target is off the top of the screen", () => {
      if (html) {
        html.scrollTop = 1000;
      }
      const { result } = renderHook(() => useScrollOnRender());
      targetNode.getBoundingClientRect = () => ({ y: 10 } as DOMRect);
      result.current(targetNode);
      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 10,
        left: 0,
        behavior: "smooth",
      });
    });

    it("scrolls if the target is partially off the bottom of the screen", () => {
      if (html) {
        html.scrollTop = 100;
      }
      const { result } = renderHook(() => useScrollOnRender());
      targetNode.getBoundingClientRect = () =>
        ({ height: 400, y: 400 } as DOMRect);
      result.current(targetNode);
      expect(scrollToSpy).toHaveBeenCalledWith({
        top: 400,
        left: 0,
        behavior: "smooth",
      });
    });
  });

  describe("useCycled", () => {
    it("can handle the initial state", () => {
      const onCycled = jest.fn();
      const { result } = renderHook(() => useCycled(false, onCycled));
      const [hasCycled] = result.current;
      expect(hasCycled).toBe(false);
      expect(onCycled).not.toHaveBeenCalled();
    });

    it("can handle rerenders when the value has not cycled", () => {
      const onCycled = jest.fn();
      const { result, rerender } = renderHook(
        ({ state }) => useCycled(state, onCycled),
        {
          initialProps: { state: false },
        }
      );
      rerender({ state: false });
      const [hasCycled] = result.current;
      expect(hasCycled).toBe(false);
      expect(onCycled).not.toHaveBeenCalled();
    });

    it("can handle rerenders when the value has cycled", () => {
      const onCycled = jest.fn();
      const { result, rerender } = renderHook(
        ({ state }) => useCycled(state, onCycled),
        {
          initialProps: { state: false },
        }
      );
      rerender({ state: true });
      const [hasCycled] = result.current;
      expect(hasCycled).toBe(true);
      expect(onCycled).toHaveBeenCalled();
    });

    it("can reset the cycle", () => {
      const onCycled = jest.fn();
      const { result, rerender } = renderHook(
        ({ state }) => useCycled(state, onCycled),
        {
          initialProps: { state: false },
        }
      );
      rerender({ state: true });
      let [hasCycled, resetCycle] = result.current;
      expect(hasCycled).toBe(true);
      expect(onCycled).toHaveBeenCalledTimes(1);
      act(() => {
        resetCycle();
      });
      [hasCycled, resetCycle] = result.current;
      expect(hasCycled).toBe(false);
      // The onCycle function should not get called when it resets.
      expect(onCycled).toHaveBeenCalledTimes(1);
    });

    it("can handle values that have cycled after a reset", () => {
      const onCycled = jest.fn();
      const { result, rerender } = renderHook(
        ({ state }) => useCycled(state, onCycled),
        {
          initialProps: { state: false },
        }
      );
      // Cycle the value to true:
      rerender({ state: true });
      let [hasCycled, resetCycle] = result.current;
      expect(hasCycled).toBe(true);
      // Reset to false:
      act(() => {
        resetCycle();
      });
      rerender({ state: false });
      [hasCycled, resetCycle] = result.current;
      expect(hasCycled).toBe(false);
      // Cycle the value back to true:
      rerender({ state: true });
      [hasCycled, resetCycle] = result.current;
      expect(hasCycled).toBe(true);
      expect(onCycled).toHaveBeenCalledTimes(2);
    });
  });

  describe("useProcessing", () => {
    it("handles whether processing has completed", () => {
      const onComplete = jest.fn();
      const onError = jest.fn();
      // Start with a count of 0
      const { rerender, result } = renderHook(
        ({ processingCount }) =>
          useProcessing({ onComplete, onError, processingCount }),
        { initialProps: { processingCount: 0 } }
      );
      expect(onComplete).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
      expect(result.current).toBe(false);

      // Start processing with a count of 1 - processing should not be complete.
      rerender({ processingCount: 1 });
      expect(onComplete).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
      expect(result.current).toBe(false);

      // Count down to 0 - processing should be complete and onComplete should run.
      rerender({ processingCount: 0 });
      expect(onComplete).toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
      expect(result.current).toBe(true);
    });

    it("handles errors occurring while processing", () => {
      const onComplete = jest.fn();
      const onError = jest.fn();
      // Start with a count of 0
      const { rerender, result } = renderHook(
        ({ hasErrors, processingCount }) =>
          useProcessing({ hasErrors, onComplete, onError, processingCount }),
        { initialProps: { hasErrors: false, processingCount: 0 } }
      );
      expect(onComplete).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
      expect(result.current).toBe(false);

      // Start processing with a count of 1 - processing should not be complete.
      rerender({ hasErrors: false, processingCount: 1 });
      expect(onComplete).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
      expect(result.current).toBe(false);

      // Count down to 0 - processing should not be complete, onComplete should
      // not run but onError should have run.
      rerender({ hasErrors: true, processingCount: 0 });
      expect(onComplete).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
      expect(result.current).toBe(false);
    });
  });

  describe("getId", () => {
    it("generates the id on first render", () => {
      const { result, rerender } = renderHook(() => useId());
      expect(result.current).toBeTruthy();
      const previousResult = result;
      rerender();
      expect(result.current).toEqual(previousResult.current);
    });
  });

  describe("useScrollToTop", () => {
    it("scrolls to the top of the page on pathname change", () => {
      const scrollToSpy = jest.fn();
      global.scrollTo = scrollToSpy;
      const { rerender } = renderHook(() => useScrollToTop());

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
      expect(scrollToSpy).toHaveBeenCalledTimes(1);

      mockUseLocationValue.pathname = "/new-pathname";
      rerender();

      expect(scrollToSpy).toHaveBeenCalledTimes(2);
    });

    it("does not scroll to the top of the page if pathname stays the same", () => {
      const scrollToSpy = jest.fn();
      global.scrollTo = scrollToSpy;
      const { rerender } = renderHook(() => useScrollToTop());

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
      expect(scrollToSpy).toHaveBeenCalledTimes(1);

      rerender();

      expect(scrollToSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("usePreviousPersistent", () => {
    it("should return null on initial render", () => {
      const { result } = renderHook(() => usePreviousPersistent({ a: "b" }));

      expect(result.current).toBeNull();
    });

    it("persists previous values on re-render", () => {
      const { rerender, result } = renderHook(
        (state) => usePreviousPersistent(state),
        {
          initialProps: 1,
        }
      );

      rerender(2);
      expect(result.current).toEqual(1);
      rerender(3);
      expect(result.current).toEqual(2);
    });
  });
});
