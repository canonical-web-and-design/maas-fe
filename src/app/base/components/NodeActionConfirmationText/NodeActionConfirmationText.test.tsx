import { render, screen } from "@testing-library/react";

import NodeActionConfirmationText from "./NodeActionConfirmationText";

import { NodeActions } from "app/store/types/node";
import { machine as machineFactory } from "testing/factories";

it("displays correct confirmation text for deleting a single node", () => {
  render(
    <NodeActionConfirmationText
      modelName="machine"
      nodes={[machineFactory({ fqdn: "test" })]}
      action={NodeActions.DELETE}
    />
  );
  expect(
    screen.getByText("Are you sure you want to delete test?")
  ).toBeInTheDocument();
});

it("displays correct confirmation text for deleting multiple nodes", () => {
  render(
    <NodeActionConfirmationText
      modelName="machine"
      nodes={[
        machineFactory({ fqdn: "test" }),
        machineFactory({ fqdn: "test2" }),
      ]}
      action={NodeActions.DELETE}
    />
  );
  expect(
    screen.getByText(/Are you sure you want to delete 2 machines?/)
  ).toBeInTheDocument();
});
