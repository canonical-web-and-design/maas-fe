import NodeNameFields from "./NodeNameFields";

import FormikForm from "@/app/base/components/FormikForm";
import type { RootState } from "@/app/store/root/types";
import * as factory from "@/testing/factories";
import { renderWithBrowserRouter, screen } from "@/testing/utils";

describe("NodeNameFields", () => {
  let state: RootState;
  beforeEach(() => {
    state = factory.rootState({
      domain: factory.domainState({
        loaded: true,
      }),
      machine: factory.machineState({
        loaded: true,
        items: [
          factory.machineDetails({
            locked: false,
            permissions: ["edit"],
            system_id: "abc123",
          }),
        ],
      }),
    });
  });

  it("displays a spinner when loading domains", () => {
    state.domain.loaded = false;
    renderWithBrowserRouter(
      <FormikForm
        initialValues={{
          domain: "",
          hostname: "",
        }}
        onSubmit={vi.fn()}
      >
        <NodeNameFields setHostnameError={vi.fn()} />
      </FormikForm>,
      {
        route: "/machine/abc123",
        state,
      }
    );
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it("displays the fields", () => {
    renderWithBrowserRouter(
      <FormikForm
        initialValues={{
          domain: "",
          hostname: "",
        }}
        onSubmit={vi.fn()}
      >
        <NodeNameFields canEditHostname setHostnameError={vi.fn()} />
      </FormikForm>,
      { route: "/machine/abc123", state }
    );

    expect(
      screen.getByRole("textbox", { name: "Hostname" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Domain" })
    ).toBeInTheDocument();
  });

  it("disables fields when saving", () => {
    renderWithBrowserRouter(
      <FormikForm
        initialValues={{
          domain: "",
          hostname: "",
        }}
        onSubmit={vi.fn()}
      >
        <NodeNameFields canEditHostname saving setHostnameError={vi.fn()} />
      </FormikForm>,
      { route: "/machine/abc123", state }
    );
    expect(screen.getByRole("textbox", { name: "Hostname" })).toBeDisabled();
    expect(screen.getByRole("combobox", { name: "Domain" })).toBeDisabled();
  });

  it("updates the hostname errors if they exist", () => {
    const setHostnameError = vi.fn();
    renderWithBrowserRouter(
      <FormikForm
        initialErrors={{ hostname: "Uh oh!" }}
        initialValues={{
          domain: "",
          hostname: "",
        }}
        onSubmit={vi.fn()}
      >
        <NodeNameFields
          canEditHostname
          saving
          setHostnameError={setHostnameError}
        />
      </FormikForm>,
      { route: "/machine/abc123", state }
    );
    expect(setHostnameError).toHaveBeenCalledWith("Uh oh!");
  });
});
