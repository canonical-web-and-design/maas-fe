import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { HardwareMenu } from "./HardwareMenu";

const generateLink = (link, linkClass) => (
  <a href={link.url} className={linkClass}>
    {link.label}
  </a>
);

describe("HardwareMenu", () => {
  afterEach(() => {
    jest.resetModules();
  });

  it("renders a list of links", () => {
    render(
      <HardwareMenu
        generateLink={generateLink}
        links={[
          {
            inHardwareMenu: true,
            isLegacy: false,
            label: "Machines",
            url: "/machines",
          },
        ]}
        toggleHardwareMenu={jest.fn()}
      />
    );

    expect(
      within(screen.getByRole("list")).getByRole("link", { name: "Machines" })
    ).toBeInTheDocument();
  });

  it("calls toggleHardwareMenu on click", () => {
    const handleToggleHardwareMenu = jest.fn();
    render(
      <HardwareMenu
        generateLink={generateLink}
        links={[
          {
            inHardwareMenu: true,
            isLegacy: false,
            label: "Machines",
            url: "/machines",
          },
        ]}
        toggleHardwareMenu={handleToggleHardwareMenu}
      />
    );

    userEvent.click(screen.getByRole("link", { name: "Machines" }));
    expect(handleToggleHardwareMenu).toHaveBeenCalledTimes(1);
  });
});
