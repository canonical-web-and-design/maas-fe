import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import SubnetsControls from "./SubnetsControls";

import { DEFAULT_DEBOUNCE_INTERVAL } from "app/base/components/DebounceSearchBox/DebounceSearchBox";

it("renders select element correctly", () => {
  render(
    <SubnetsControls
      groupBy="fabric"
      setGroupBy={jest.fn()}
      handleSearch={jest.fn()}
    />
  );
  expect(screen.getByRole("combobox", { name: "Group by" })).toBeVisible();
});

it("displays additional information for group by on press", async () => {
  render(
    <SubnetsControls
      groupBy="fabric"
      setGroupBy={jest.fn()}
      handleSearch={jest.fn()}
    />
  );
  expect(
    screen.queryByTestId("subnets-groupby-help-text")
  ).not.toBeInTheDocument();
  await userEvent.click(
    screen.getByRole("button", { name: "more about group by" })
  );
  expect(screen.getByTestId("subnets-groupby-help-text")).toBeInTheDocument();
});

it("calls handleSearch with a correct value on user input", async () => {
  // As of v14 userEvent always returns a Promise and by default it waits for a
  // setTimeout delay during its execution. Since jest.useFakeTimers() replaces
  // the original timer functions, userEvent waits indefinitely. We overwrite
  // this default delay behaviour by setting it to null during setup.
  jest.useFakeTimers();
  const user = userEvent.setup({ delay: null });
  const handleSearch = jest.fn();
  render(
    <SubnetsControls
      groupBy="fabric"
      setGroupBy={jest.fn()}
      handleSearch={handleSearch}
    />
  );
  await user.type(screen.getByRole("searchbox", { name: "Search" }), "test");
  await waitFor(() => {
    jest.advanceTimersByTime(DEFAULT_DEBOUNCE_INTERVAL);
  });

  expect(handleSearch).toHaveBeenCalledTimes(1);
  expect(handleSearch).toHaveBeenCalledWith("test");
  jest.useRealTimers();
});
