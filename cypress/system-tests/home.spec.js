describe('Home', function() {
  it('should load the application', function() {
    cy.visit('/');
    cy.get('.cover-heading').should('exist');
  });
});
