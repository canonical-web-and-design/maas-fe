import * as reactQuery from "@tanstack/react-query";

import { useWebsocketAwareQuery } from "./base";

import { rootState, statusState } from "@/testing/factories";
import { renderHookWithMockStore } from "@/testing/utils";

vi.mock("@tanstack/react-query");

const mockQueryFn = vi.fn();
const mockQueryKey = ["zones"] as const;

beforeEach(() => {
  vi.resetAllMocks();
  const mockQueryClient = {
    invalidateQueries: vi.fn(),
  } as unknown as reactQuery.QueryClient;
  vi.mocked(reactQuery.useQueryClient).mockReturnValue(mockQueryClient);
  vi.mocked(reactQuery.useQuery).mockReturnValue({
    data: "testData",
    isLoading: false,
  } as reactQuery.UseQueryResult);
});

it("calls useQuery with correct parameters", () => {
  renderHookWithMockStore(() =>
    useWebsocketAwareQuery(mockQueryKey, mockQueryFn)
  );
  expect(reactQuery.useQuery).toHaveBeenCalledWith({
    queryKey: mockQueryKey,
    queryFn: mockQueryFn,
  });
});

it("invalidates queries when connectedCount changes", () => {
  const initialState = rootState({
    status: statusState({ connectedCount: 0 }),
  });
  const { rerender } = renderHookWithMockStore(
    () => useWebsocketAwareQuery(mockQueryKey, mockQueryFn),
    { initialState }
  );

  const mockInvalidateQueries = vi.fn();
  const mockQueryClient = {
    invalidateQueries: mockInvalidateQueries,
  } as unknown as reactQuery.QueryClient;
  vi.mocked(reactQuery.useQueryClient).mockReturnValue(mockQueryClient);

  rerender({
    initialState: rootState({ status: statusState({ connectedCount: 1 }) }),
  });
  expect(mockInvalidateQueries).toHaveBeenCalled();
});

it("returns the result of useQuery", () => {
  const { result } = renderHookWithMockStore(() =>
    useWebsocketAwareQuery(mockQueryKey, mockQueryFn)
  );
  expect(result.current).toEqual({ data: "testData", isLoading: false });
});
