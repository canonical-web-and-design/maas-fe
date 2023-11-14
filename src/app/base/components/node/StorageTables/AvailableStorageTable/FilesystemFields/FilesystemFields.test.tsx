import { Formik } from "formik";

import FilesystemFields from "./FilesystemFields";

import {
  machineDetails as machineDetailsFactory,
  machineState as machineStateFactory,
  rootState as rootStateFactory,
} from "@/testing/factories";
import { renderWithMockStore, screen, userEvent } from "@/testing/utils";

describe("FilesystemFields", () => {
  it("only shows filesystem types that require a storage device", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            supported_filesystems: [
              { key: "fat32", ui: "fat32" }, // requires storage
              { key: "ramfs", ui: "ramfs" }, // does not require storage
            ],
            system_id: "abc123",
          }),
        ],
      }),
    });
    renderWithMockStore(
      <Formik
        initialValues={{ fstype: "", mountOptions: "", mountPoint: "" }}
        onSubmit={vi.fn()}
      >
        <FilesystemFields systemId="abc123" />
      </Formik>,
      { state }
    );

    expect(screen.getByRole("option", { name: /fat32/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /ramfs/i })
    ).not.toBeInTheDocument();
  });

  it("disables mount point and options if no fstype selected", () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            supported_filesystems: [{ key: "fat32", ui: "fat32" }],
            system_id: "abc123",
          }),
        ],
      }),
    });
    renderWithMockStore(
      <Formik
        initialValues={{ fstype: "", mountOptions: "", mountPoint: "" }}
        onSubmit={vi.fn()}
      >
        <FilesystemFields systemId="abc123" />
      </Formik>,
      { state }
    );

    expect(screen.getByLabelText(/Mount Options/i)).toBeDisabled();
    expect(screen.getByLabelText(/Mount Point/i)).toBeDisabled();
  });

  it("sets mount point to 'none' and disables field if swap fstype selected", async () => {
    const state = rootStateFactory({
      machine: machineStateFactory({
        items: [
          machineDetailsFactory({
            supported_filesystems: [{ key: "swap", ui: "swap" }],
            system_id: "abc123",
          }),
        ],
      }),
    });
    renderWithMockStore(
      <Formik
        initialValues={{ fstype: "", mountOptions: "", mountPoint: "" }}
        onSubmit={vi.fn()}
      >
        <FilesystemFields systemId="abc123" />
      </Formik>,
      { state }
    );

    await userEvent.selectOptions(screen.getByLabelText(/Filesystem/i), "swap");
    expect(screen.getByLabelText(/Mount Options/i)).not.toBeDisabled();
    expect(screen.getByLabelText(/Mount Point/i)).toBeDisabled();
    expect(screen.getByLabelText(/Mount Point/i)).toHaveValue("none");
  });
});
