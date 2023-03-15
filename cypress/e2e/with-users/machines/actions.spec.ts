import { generateMAASURL, generateName } from "../../utils";

const MACHINE_ACTIONS = [
  "Commission",
  "Allocate",
  "Deploy",
  "Release",
  "Abort",
  "Clone from",
  "Power on",
  "Power off",
  "Test",
  "Enter rescue mode",
  "Exit rescue mode",
  "Mark fixed",
  "Mark broken",
  "Override failed testing",
  "Lock",
  "Unlock",
  "Tag",
  "Set zone",
  "Set pool",
  "Delete",
];

const selectFirstMachine = () =>
  cy.findByRole("grid", { name: /Machines/i }).within(() => {
    cy.findAllByRole("gridcell", { name: /FQDN/i })
      .first() // eslint-disable-next-line cypress/no-force
      .within(() => cy.findByRole("checkbox").click({ force: true }));
  });

const openMachineActionForm = (action) => {
  cy.findByTestId("section-header-buttons").within(() => {
    cy.findByRole("button", { name: /Take action/i }).click();
  });
  cy.findByLabelText("submenu").within(() => {
    cy.findAllByRole("button", {
      name: new RegExp(`${action}...`),
    }).click();
  });
};

context("Machine listing - actions", () => {
  const machineName = generateName("machine");
  before(() => {
    cy.login();
    cy.addMachine(machineName);
  });
  beforeEach(() => {
    cy.login();
    cy.visit(generateMAASURL("/machines"));
    cy.waitForPageToLoad();
    // cy.wait for table data to fully load
    cy.waitForTableToLoad({ name: "Machines" });
  });

  it("displays the correct actions in the action menu", () => {
    selectFirstMachine();
    cy.findByTestId("section-header-buttons").within(() => {
      cy.findByRole("button", { name: /Take action/i }).click();
    });
    cy.findByLabelText("submenu").within(() => {
      cy.findAllByRole("button").should("have.length", MACHINE_ACTIONS.length);
      cy.findAllByRole("button").should("be.enabled");
    });
  });

  MACHINE_ACTIONS.forEach((action) =>
    it(`loads machine ${action} form`, () => {
      selectFirstMachine();
      openMachineActionForm(action);
      cy.findByRole("complementary", { name: action }).within(() => {
        cy.findAllByText(/Loading/).should("have.length", 0);
        cy.findByRole("heading", { name: action });
        cy.findByRole("button", { name: /Cancel/i }).click();
      });
      // expect the action form to be closed
      cy.findByRole("complementary", { name: action }).should("not.exist");
    })
  );

  it("can create and set the zone of a machine", () => {
    const poolName = generateName("pool");
    const machineName = generateName("machine");
    cy.addMachine(machineName);
    cy.findByRole("searchbox", { name: "Search" }).type(machineName);
    // eslint-disable-next-line cypress/no-force
    cy.findByRole("checkbox", { name: `${machineName}.maas` }).click({
      force: true,
    });
    openMachineActionForm("Set pool");
    cy.findByRole("complementary", { name: /Set pool/i }).should("exist");
    // eslint-disable-next-line cypress/no-force
    cy.findByLabelText(/Create pool/i).click({ force: true });
    cy.findByLabelText(/Name/i).type(poolName);
    cy.findByRole("button", { name: /Set pool for machine/i }).click();
    cy.findByRole("complementary", { name: /Set pool/i }).should("not.exist");
    cy.findByRole("grid", { name: /Machines/i })
      .within(() => cy.findByText(poolName))
      .should("exist");
    cy.deleteMachine(machineName);
    cy.deletePool(poolName);
  });
});
