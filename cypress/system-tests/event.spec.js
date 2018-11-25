describe('Event', function() {
  before(() => {
    Cypress.Cookies.debug(true);
    cy.exec('MONGOLAB_URI=mongodb://localhost:27017/testing npm run clean-db');
    cy.exec('MONGOLAB_URI=mongodb://localhost:27017/testing npm run create-db --multiplier 10');

    cy.request('GET', '/api/users?userType=Place').then(response => {
      const user = response.body.data[1];
      const userEmail = user.email;
      cy
        .request('POST', '/api/login', {
          email: userEmail,
          password: 'password'
        })
        .its('body.data')
        .as('user');

      cy.request('GET', `api/events?userType=Place&userId=${user._id}`).then(response => {
        const event = response.body.data.filter(x => new Date(x.date) > new Date())[0];
        cy.wrap(event._id).as('eventId');
      });
    });
  });

  beforeEach(function() {
    Cypress.Cookies.preserveOnce('connect.sid');
  });

  it('should load', function() {
    cy.visit(`/events/${this.eventId}`);
    cy.get('.event-page').should('exist');
  });

  it('TSOF9.1.3 should show the partecipants of the event', function() {
    cy.visit(`/events/${this.eventId}`);
    cy.get('.event-page').should('contain', 'Partecipants: ');
  });

  it('TSOF9.1.5 should edit the event', function() {
    cy.visit(`/events/edit/${this.eventId}`);
    cy
      .get('input#name')
      .clear()
      .type('New name');
    cy
      .get('#PlacesAutocomplete__root input')
      .clear()
      .type('Padova');
    cy
      .get('button[type="submit"]')
      .contains('Save the event')
      .click();

    cy.get('.event-page-header').should('contain', 'New name');
  });

  it('TSOF11.1 should download the QR code', function() {
    cy.visit(`/events/${this.eventId}`, {
      onBeforeLoad(window) {
        cy.stub(window, 'open');
      }
    });
    cy
      .get('.event-page .btn.btn-link')
      .contains('Download QR Code')
      .click();

    cy
      .window()
      .its('open')
      .should('be.called');
  });

  it('TSOF9.1.6 should delete the event', function() {
    cy.visit(`/events/${this.eventId}`);
    cy
      .get('.event-page .btn.btn-link')
      .contains('Delete event')
      .click();
    cy
      .get('.modal .btn.btn-danger')
      .contains('Confirm')
      .click();

    cy.url().should('contain', '/app');
  });
});
