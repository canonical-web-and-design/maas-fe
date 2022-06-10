import { render, screen, getDefaultNormalizer } from "@testing-library/react";

import NonBreakingSpace from "./NonBreakingSpace";

it("renders a non breaking space correctly", () => {
  render(
    <>
      1<NonBreakingSpace />2
    </>
  );
  expect(
    screen.getByText("1 2", {
      normalizer: getDefaultNormalizer({ collapseWhitespace: false }),
    })
  ).toBeInTheDocument();
  expect(screen.getByText("1 2")).toBeInTheDocument();
});
