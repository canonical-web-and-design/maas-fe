import { mount } from "enzyme";
import React from "react";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import ScriptsUpload from "./ScriptsUpload";

const mockStore = configureStore();

const createFile = (name, size, type, contents = "") => {
  const file = new File([contents], name, { type });
  Reflect.defineProperty(file, "size", {
    get() {
      return size;
    }
  });
  return file;
};

describe("ScriptsUpload", () => {
  let initialState;
  beforeEach(() => {
    initialState = {
      scripts: {
        loading: false,
        loaded: true,
        errors: {},
        items: []
      }
    };
  });

  it("accepts files of text mimetype", async () => {
    const store = mockStore(initialState);

    const files = [createFile("foo.sh", 2000, "text/script")];

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/" }]}>
          <ScriptsUpload type="testing" />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      wrapper.find("input").simulate("change", {
        target: { files },
        preventDefault: () => {},
        persist: () => {}
      });
    });

    expect(wrapper.text()).toContain("foo.sh (2000 bytes) ready for upload");
  });

  it("displays an error if a file with a non text mimetype is uploaded", async () => {
    const store = mockStore(initialState);
    const files = [createFile("foo.jpg", 200, "image/jpg")];

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/" }]}>
          <ScriptsUpload type="testing" />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      wrapper.find("input").simulate("change", {
        target: { files },
        preventDefault: () => {},
        persist: () => {}
      });
    });

    expect(store.getActions()[0]["payload"]["message"]).toEqual(
      "Invalid filetype, please try again."
    );
  });

  it("displays an error if a file larger than 2MB is uploaded", async () => {
    const store = mockStore(initialState);
    const files = [createFile("foo.sh", 3000000, "text/script")];

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/" }]}>
          <ScriptsUpload type="testing" />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      wrapper.find("input").simulate("change", {
        target: { files },
        preventDefault: () => {},
        persist: () => {}
      });
    });

    expect(store.getActions()[0]["payload"]["message"]).toEqual(
      "File size must be 2000000 bytes, or fewer."
    );
  });

  it("displays an error if multiple files are uploaded", async () => {
    const store = mockStore(initialState);
    const files = [
      createFile("foo.sh", 1000, "text/script"),
      createFile("bar.sh", 1000, "text/script")
    ];

    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/" }]}>
          <ScriptsUpload type="testing" />
        </MemoryRouter>
      </Provider>
    );

    await act(async () => {
      wrapper.find("input").simulate("change", {
        target: { files },
        preventDefault: () => {},
        persist: () => {}
      });
    });

    expect(store.getActions()[0]["payload"]["message"]).toEqual(
      "Only a single file may be uploaded."
    );
  });
});
