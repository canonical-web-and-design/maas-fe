import { render, screen } from "@testing-library/react";

import StorageMeter from "./StorageMeter";

import * as factory from "@/testing/factories";

const pools = {
  "pool-1": factory.podStoragePoolResource({
    allocated_other: 1,
    allocated_tracked: 2,
    backend: "zfs",
    name: "pool-1",
    path: "/path1",
    total: 3,
  }),
};

describe("StorageMeter", () => {
  it("renders", () => {
    render(<StorageMeter pools={pools} />);

    expect(screen.getByText("Allocated")).toBeInTheDocument();
  });

  it("does not render if more than one pool present", () => {
    render(
      <StorageMeter
        pools={{ ...pools, "pool-2": factory.podStoragePoolResource() }}
      />
    );

    expect(screen.queryByText("Allocated")).not.toBeInTheDocument();
  });
});
