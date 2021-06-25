import { generateNewURL } from "@maas-ui/maas-ui-shared";

import { login } from "../utils";

context("DNS", () => {
  beforeEach(() => {
    login();
    cy.setCookie("skipintro", "true");
    cy.visit(generateNewURL("/domains"));
  });

  afterEach(() => {
    cy.clearCookie("skipintro");
  });

  it("renders the correct heading", () => {
    cy.get("[data-test='section-header-title']").contains("DNS");
  });

  it("highlights the correct navigation link", () => {
    cy.get(".p-navigation__link.is-selected a").should(
      "have.attr",
      "href",
      generateNewURL("/domains")
    );
  });
});
