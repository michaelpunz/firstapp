describe('Logout', function() {
  before(() => {
    Cypress.Cookies.debug(true);
    cy.exec('MONGOLAB_URI=mongodb://localhost:27017/testing npm run clean-db');
    cy.exec('MONGOLAB_URI=mongodb://localhost:27017/testing npm run create-db --multiplier 1');

    cy.request('GET', '/api/users?userType=Artist').then(response => {
      const userEmail = response.body.data[0].email;
      cy
        .request('POST', '/api/login', {
          email: userEmail,
          password: 'password'
        })
        .its('body.data')
        .as('user');
    });
  });

  beforeEach(function() {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit('/app');
  });

  it('should load', function() {
    cy.get('.container-fluid').should('contain', 'Welcome');
  });

  it('TSOF3 should logout', function() {
    cy.contains('Logout').click({ force: true }); // Avoid error about hidden element
    cy.url().should('include', '/logout');
  });
});
