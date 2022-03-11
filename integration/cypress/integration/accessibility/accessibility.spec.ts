import { generateNewURL } from "@maas-ui/maas-ui-shared";
import { pages } from "../../constants";

pages.forEach(({ heading, url }) => {
  it(`"${heading}" page has no detectable accessibility violations on load`, () => {
    if (url === "/intro/user") {
      cy.login({ shouldSkipIntro: false });
    } else if (url !== "/accounts/login") {
      cy.login();
    }
    const pageUrl = generateNewURL(url);

    cy.visit(pageUrl);
    cy.waitForPageToLoad();
    cy.get("[data-testid='section-header-title']").contains(heading);

    cy.testA11y({ url, title: heading });
  });
});
