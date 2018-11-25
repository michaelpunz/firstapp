describe('Profile settings', function() {
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
  });

  it('should load', function() {
    cy.visit('/settings/profile');
    cy.get('.container-fluid').should('contain', 'Edit profile');
  });

  it('TSOF6.1 should edit the profile', function() {
    cy.visit('/settings/profile');
    cy
      .get('input#name')
      .clear()
      .type('New name');
    cy.get('#PlacesAutocomplete__root input').type('Padova');
    cy.get('textarea#description').type('Description');
    cy
      .get('button[type="submit"]')
      .contains('Save the profile')
      .click();

    cy.get('.profile h1').should('contain', 'New name');
  });

  it('TSOF6.1.2 should edit the password', function() {
    cy.visit('/settings/credentials');
    cy.get('input[placeholder="Old password"]').type('password');
    cy.get('input[placeholder="New password"]').type('password1');
    cy.get('input[placeholder="Confirm password"]').type('password1');
    cy
      .get('button[type="submit"]')
      .contains('Update')
      .click();

    cy.get('.profile').should('exist');
  });

  it('TSFF6.1.10 should delete the account', function() {
    cy.visit('/settings/delete');
    cy.get('input#password').type('password1'); // The password is the one updated before
    cy
      .get('button[type="submit"]')
      .contains('Confirm Deletion')
      .click();

    cy.location('pathname').should('eq', '/');
  });
});

describe('Profile page', function() {
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
  });

  it('TSOF10.1 should show the feedbacks', function() {
    cy.visit(`/profile/${this.user._id}`);

    cy.get('.dv-star-rating').should('have.length.above', 0);
  });
});
