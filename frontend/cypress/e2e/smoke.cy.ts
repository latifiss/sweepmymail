describe("smoke", () => {
  it("loads the app", () => {
    cy.visit("/");
    cy.location("pathname").should("match", /(\/scroll|\/subscriptions)/);
  });
});

