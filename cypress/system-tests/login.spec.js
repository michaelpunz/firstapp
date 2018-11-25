describe('Login', function() {
  before(() => {
    cy.exec('MONGOLAB_URI=mongodb://localhost:27017/testing npm run clean-db');
    cy.exec('MONGOLAB_URI=mongodb://localhost:27017/testing npm run create-db --multiplier 1');

    cy.request('GET', '/api/users?userType=Artist').then(response => {
      cy.wrap(response.body.data[1].email).as('userEmail');
    });
  });

  beforeEach(() => {
    cy.visit('/login');
  });

  it('should load', function() {
    cy.get('form').should('contain', 'Email');
  });

  it('TSFF2.2 should login the user and redirect to dashboard', function() {
    cy.get('input.email').type(this.userEmail);
    cy.get('input.password').type('password');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/app');
  });

  it('TSOF2.3 should allow Google login', function() {
    cy.get('.btn-google').should('contain', 'Login with Google');
  });

  it('TSOF2.4 should allow Facebook login', function() {
    cy.get('.btn-facebook').should('contain', 'Login with Facebook');
  });
});
