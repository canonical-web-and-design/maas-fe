import { generateNewURL } from "@maas-ui/maas-ui-shared";

import { clearCookies } from "../utils";

context("Login page", () => {
  beforeEach(() => {
    cy.visit(generateNewURL("/"));
  });

  it("has no detectable accessibility violations on load", () => {
    cy.title().should("include", "Login");

    cy.injectAxe();
    cy.checkA11y();
  });

  it("is disabled by default", () => {
    cy.get("button").should("have.attr", "disabled", "disabled");
  });

  it("shows form errors if username is focused and blurred while empty", () => {
    cy.get("input[name='username']").focus();
    cy.get("input[name='username']").blur();
    cy.get(".p-form-validation__message").should("exist");
  });

  it("shows form errors if password is focused and blurred while empty", () => {
    cy.get("input[name='password']").focus();
    cy.get("input[name='password']").blur();
    cy.get(".p-form-validation__message").should("exist");
  });

  it("enables the form if both fields have values", () => {
    cy.get("button").should("have.attr", "disabled", "disabled");
    cy.get("input[name='username']").type("username");
    cy.get("input[name='password']").type("password");
    cy.get("button").should("not.have.attr", "disabled", "disabled");
  });

  it("displays an error notification if wrong credentials provided", () => {
    cy.server();
    cy.get("input[name='username']").type("username");
    cy.get("input[name='password']").type("password{enter}");
    cy.get(".p-notification--negative").should("exist");
  });

  it("logs in and redirects to the intro", () => {
    cy.get("input[name='username']").type(Cypress.env("username"));
    cy.get("input[name='password']").type(Cypress.env("password"));
    cy.get("button[type='submit']").click();
    cy.location("pathname").should("eq", generateNewURL("/intro"));
  });

  it("logs in and redirects to the user intro if setup intro complete", () => {
    // Log in - should go to setup intro.
    cy.get("input[name='username']").type(Cypress.env("username"));
    cy.get("input[name='password']").type(Cypress.env("password"));
    cy.get("button[type='submit']").click();
    cy.location("pathname").should("eq", generateNewURL("/intro"));

    // Log out.
    cy.get(".p-navigation__link a:contains(Log out)").click();

    // Set cookie to skip setup intro.
    cy.setCookie("skipsetupintro", "true");

    // Log in again - should go straight to user intro.
    cy.get("input[name='username']").type(Cypress.env("username"));
    cy.get("input[name='password']").type(Cypress.env("password"));
    cy.get("button[type='submit']").click();
    cy.location("pathname").should("eq", generateNewURL("/intro/user"));
  });

  it("logs in and redirects to the machine list", () => {
    // Set cookies to skip setup and user intros.
    cy.setCookie("skipsetupintro", "true");
    cy.setCookie("skipintro", "true");
    cy.get("input[name='username']").type(Cypress.env("username"));
    cy.get("input[name='password']").type(Cypress.env("password"));
    cy.get("button[type='submit']").click();
    cy.location("pathname").should("eq", generateNewURL("/machines"));
  });
});
