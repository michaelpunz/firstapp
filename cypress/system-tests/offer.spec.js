describe('Offer creation/acceptance', function() {
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

    cy.request('GET', '/api/users?userType=Place').then(response => {
      cy.wrap(response.body.data[0]._id).as('placeId');
    });

    cy.request('GET', '/api/search?type=Event').then(response => {
      cy.wrap(response.body.data[0]._id).as('eventId');
    });
  });

  beforeEach(function() {
    Cypress.Cookies.preserveOnce('connect.sid');
  });

  it('should load', function() {
    cy.visit(`/events/${this.eventId}`);
    cy.get('.event-page').should('exist');
  });

  it('TSOF8.1.1 should send an offer to the place for a new event', function() {
    cy.visit(`/profile/${this.placeId}`);
    cy
      .get('.profile-actions .btn')
      .contains('Propose event')
      .click();
    cy.get('.modal input[type="number"]').type('1000');
    cy.get('.modal textarea#message').type('Hello');
    cy
      .get('.modal .btn.btn-primary')
      .contains('Send proposal')
      .click();

    cy.get('.modal textarea#message').should('not.exist');
  });

  it('TSOF9.1.4 should send an offer to the place for the event', function() {
    cy.visit(`/events/${this.eventId}`);
    cy
      .get('.event-page button.btn-link')
      .contains('Apply')
      .click();
    cy.get('.modal textarea#message').type('Hello');
    cy.get('.modal input[type="number"]').type('1000');
    cy
      .get('.modal .btn.btn-primary')
      .contains('Send your application')
      .click();

    cy.get('.modal textarea#message').should('not.exist');
  });

  it('TSOF8.1.3 should accept the offer', function() {
    cy.visit(`/chat`);
    cy
      .get('.chat-col-offer .btn')
      .contains('Accept negotiation')
      .click();
    cy
      .get('.modal .btn.btn-danger')
      .contains('Confirm')
      .click();

    cy.get('.chat-col-offer .alert').should('contain', 'The artist has accepted the offer');
  });
});

describe('Offer decline', function() {
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

  it('TSOF8.1.4 should decline the offer', function() {
    cy.visit(`/chat`);
    cy
      .get('.chat-col-offer .btn')
      .contains('Terminate negotiation')
      .click();
    cy.get('.modal input.form-control').type('Reason');
    cy
      .get('.modal .btn.btn-danger')
      .contains('Confirm')
      .click();

    cy.get('.chat-col-offer .alert').should('contain', 'The offer has been declined');
  });
});
