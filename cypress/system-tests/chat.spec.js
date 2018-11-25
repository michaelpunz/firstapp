describe('Chat', function() {
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
    cy.visit(`/chat`);
  });

  it('should load', function() {
    cy.get('.chat').should('exist');
  });

  it('TSOF8.3 should send the message', function() {
    cy.get('.chat-composer input.form-control').type('New message{enter}');

    cy.get('.chat-messages').should('contain', 'New message');
  });
});
