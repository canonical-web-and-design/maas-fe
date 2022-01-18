import reducers, { actions } from "./slice";

import {
  subnet as subnetFactory,
  subnetState as subnetStateFactory,
} from "testing/factories";

describe("subnet reducer", () => {
  it("should return the initial state", () => {
    expect(reducers(undefined, { type: "" })).toEqual(subnetStateFactory());
  });

  describe("fetch", () => {
    it("reduces fetchStart", () => {
      const initialState = subnetStateFactory({ loading: false });

      expect(reducers(initialState, actions.fetchStart())).toEqual(
        subnetStateFactory({ loading: true })
      );
    });

    it("reduces fetchSuccess", () => {
      const initialState = subnetStateFactory({
        items: [],
        loaded: false,
        loading: true,
      });
      const subnets = [subnetFactory(), subnetFactory()];

      expect(reducers(initialState, actions.fetchSuccess(subnets))).toEqual(
        subnetStateFactory({
          items: subnets,
          loaded: true,
          loading: false,
        })
      );
    });

    it("reduces fetchError", () => {
      const initialState = subnetStateFactory({
        errors: null,
        loading: true,
      });

      expect(
        reducers(initialState, actions.fetchError("Could not fetch subnets"))
      ).toEqual(
        subnetStateFactory({
          errors: "Could not fetch subnets",
          loading: false,
        })
      );
    });
  });

  describe("create", () => {
    it("reduces createStart", () => {
      const initialState = subnetStateFactory({ saving: false });

      expect(reducers(initialState, actions.createStart())).toEqual(
        subnetStateFactory({ saving: true })
      );
    });

    it("reduces createSuccess", () => {
      const initialState = subnetStateFactory({
        saved: false,
        saving: true,
      });

      expect(reducers(initialState, actions.createSuccess())).toEqual(
        subnetStateFactory({ saved: true, saving: false })
      );
    });

    it("reduces createNotify", () => {
      const initialState = subnetStateFactory({
        items: [subnetFactory()],
      });
      const newSubnet = subnetFactory();

      expect(reducers(initialState, actions.createNotify(newSubnet))).toEqual(
        subnetStateFactory({
          items: [...initialState.items, newSubnet],
        })
      );
    });

    it("reduces createError", () => {
      const initialState = subnetStateFactory({
        errors: null,
        saving: true,
      });

      expect(
        reducers(initialState, actions.createError("Could not create subnet"))
      ).toEqual(
        subnetStateFactory({
          errors: "Could not create subnet",
          saving: false,
        })
      );
    });
  });

  describe("update", () => {
    it("reduces updateStart", () => {
      const initialState = subnetStateFactory({ saving: false });

      expect(reducers(initialState, actions.updateStart())).toEqual(
        subnetStateFactory({ saving: true })
      );
    });

    it("reduces updateSuccess", () => {
      const initialState = subnetStateFactory({
        saved: false,
        saving: true,
      });

      expect(reducers(initialState, actions.updateSuccess())).toEqual(
        subnetStateFactory({ saved: true, saving: false })
      );
    });

    it("reduces updateNotify", () => {
      const initialState = subnetStateFactory({
        items: [subnetFactory()],
      });
      const updatedSubnet = subnetFactory({
        id: initialState.items[0].id,
        name: "updated-reducers",
      });

      expect(
        reducers(initialState, actions.updateNotify(updatedSubnet))
      ).toEqual(subnetStateFactory({ items: [updatedSubnet] }));
    });

    it("reduces updateError", () => {
      const initialState = subnetStateFactory({
        errors: null,
        saving: true,
      });

      expect(
        reducers(initialState, actions.updateError("Could not update subnet"))
      ).toEqual(
        subnetStateFactory({
          errors: "Could not update subnet",
          saving: false,
        })
      );
    });
  });

  describe("delete", () => {
    it("reduces deleteStart", () => {
      const initialState = subnetStateFactory({ saving: false });

      expect(reducers(initialState, actions.deleteStart())).toEqual(
        subnetStateFactory({ saving: true })
      );
    });

    it("reduces deleteSuccess", () => {
      const initialState = subnetStateFactory({
        saved: false,
        saving: true,
      });

      expect(reducers(initialState, actions.deleteSuccess())).toEqual(
        subnetStateFactory({ saved: true, saving: false })
      );
    });

    it("reduces deleteNotify", () => {
      const [deleteSubnet, keepSubnet] = [subnetFactory(), subnetFactory()];
      const initialState = subnetStateFactory({
        items: [deleteSubnet, keepSubnet],
      });

      expect(
        reducers(initialState, actions.deleteNotify(deleteSubnet.id))
      ).toEqual(subnetStateFactory({ items: [keepSubnet] }));
    });

    it("reduces deleteError", () => {
      const initialState = subnetStateFactory({
        errors: null,
        saving: true,
      });

      expect(
        reducers(initialState, actions.deleteError("Could not delete subnet"))
      ).toEqual(
        subnetStateFactory({
          errors: "Could not delete subnet",
          saving: false,
        })
      );
    });
  });

  describe("get", () => {
    it("reduces getStart", () => {
      const initialState = subnetStateFactory({ loading: false });

      expect(reducers(initialState, actions.getStart())).toEqual(
        subnetStateFactory({ loading: true })
      );
    });

    it("reduces getError", () => {
      const initialState = subnetStateFactory({ errors: null, loading: true });

      expect(
        reducers(initialState, actions.getError({ id: "id was not supplied" }))
      ).toEqual(
        subnetStateFactory({
          errors: { id: "id was not supplied" },
          loading: false,
        })
      );
    });

    it("reduces getSuccess when subnet already exists in state", () => {
      const initialState = subnetStateFactory({
        items: [subnetFactory({ id: 0, name: "subnet-1" })],
        loading: true,
      });
      const updatedSubnet = subnetFactory({
        id: 0,
        name: "subnet-1-new",
      });

      expect(reducers(initialState, actions.getSuccess(updatedSubnet))).toEqual(
        subnetStateFactory({
          items: [updatedSubnet],
          loading: false,
        })
      );
    });

    it("reduces getSuccess when subnet does not exist yet in state", () => {
      const initialState = subnetStateFactory({
        items: [subnetFactory({ id: 0 })],
        loading: true,
      });
      const newSubnet = subnetFactory({ id: 1 });

      expect(reducers(initialState, actions.getSuccess(newSubnet))).toEqual(
        subnetStateFactory({
          items: [...initialState.items, newSubnet],
          loading: false,
        })
      );
    });
  });

  describe("setActive", () => {
    it("reduces setActiveSuccess", () => {
      const initialState = subnetStateFactory({ active: null });

      expect(
        reducers(
          initialState,
          actions.setActiveSuccess(subnetFactory({ id: 0 }))
        )
      ).toEqual(subnetStateFactory({ active: 0 }));
    });

    it("reduces setActiveError", () => {
      const initialState = subnetStateFactory({
        active: 0,
        errors: null,
      });

      expect(
        reducers(initialState, actions.setActiveError("Subnet does not exist"))
      ).toEqual(
        subnetStateFactory({
          active: null,
          errors: "Subnet does not exist",
        })
      );
    });
  });
});
