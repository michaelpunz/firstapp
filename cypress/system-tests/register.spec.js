describe('Register', function() {
  before(() => {
    cy.exec('MONGOLAB_URI=mongodb://localhost:27017/testing npm run clean-db');
  });

  beforeEach(() => {
    cy.visit('/register');
  });

  it('should load', function() {
    cy.get('form').should('contain', 'Email');
  });

  it('TSOF1.1 should allow Google registration', function() {
    cy.get('.btn-google').should('contain', 'Register with Google');
  });

  it('TSDF1.2 should allow Facebook registration', function() {
    cy.get('.btn-facebook').should('contain', 'Register with Facebook');
  });

  it('TSFF1.3 TSOF1.6 should register the user, fill the profile and redirect to the dashboard', function() {
    cy.get('input.email').type('tester@gmail.com');
    cy.get('input.password').type('password');
    cy.get('input.confirm-pasword').type('password');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/register/profile');

    cy.get('input#name').type('Tester');
    cy.get('#PlacesAutocomplete__root input').type('Padova');
    cy.get('textarea#description').type('Description');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/app');
  });
});
