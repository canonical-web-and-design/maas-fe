export type TSFixMe = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export type Sort = {
  direction: "ascending" | "descending" | "none";
  key: string;
};

export type RouteParams = {
  id: string;
};

export type AnalyticsEvent = {
  action: string;
  category: string;
  label: string;
};

export type SelectedAction<A, E> = {
  name: A;
  extras?: E;
};

export type SetSelectedAction<SA> = (action: SA | null) => void;

export type ClearSelectedAction = () => void;

export type AnyObject = Record<string, unknown>;

export type EmptyObject = Record<string, never>;

export type APIError =
  | string
  | string[]
  | Record<"__all__" | string, string | string[]>
  | null;
