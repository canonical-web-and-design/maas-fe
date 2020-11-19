import { mount } from "enzyme";
import React from "react";
import { MemoryRouter } from "react-router-dom";

import { machineDisk as diskFactory } from "testing/factories";
import { normaliseStorageDevice } from "../utils";
import TagLinks from "./TagLinks";

describe("TagLinks", () => {
  it("shows links to filter machine list by storage tag", () => {
    const disk = diskFactory({ tags: ["tag-1", "tag-2"] });
    const normalised = normaliseStorageDevice(disk);
    const wrapper = mount(
      <MemoryRouter
        initialEntries={[{ pathname: "/machine/abc123", key: "testKey" }]}
      >
        <TagLinks tags={normalised.tags} />
      </MemoryRouter>
    );

    expect(wrapper.find("Link").length).toBe(2);
    expect(wrapper.find("Link").at(0).prop("to")).toBe(
      "/machines?storage_tags=%3Dtag-1"
    );
  });
});
