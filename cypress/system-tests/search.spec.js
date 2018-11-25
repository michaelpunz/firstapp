describe('Search', function() {
  before(() => {
    cy.exec('MONGOLAB_URI=mongodb://localhost:27017/testing npm run clean-db');
    cy.exec('MONGOLAB_URI=mongodb://localhost:27017/testing npm run create-db --multiplier 1');
  });

  beforeEach(() => {
    cy.visit('/search');
  });

  it('should load', function() {
    cy.get('.container-fluid').should('contain', 'Search');
  });

  it('TSOF4.1.1 should search for places', function() {
    cy.get('ul.list select.form-control').select('Place');
    cy
      .get('button[type="submit"]')
      .contains('Search')
      .click();

    cy.get('.place-preview').should('have.length.above', 0);
  });

  it('TSOF4.1.2 should search for artists', function() {
    cy.get('ul.list select.form-control').select('Artist');
    cy
      .get('button[type="submit"]')
      .contains('Search')
      .click();

    cy.get('.artist-preview').should('have.length.above', 0);
  });

  it('TSOF4.2 should show the Google map', function() {
    cy.get('ul.list select.form-control').select('Event');
    cy
      .get('button[type="submit"]')
      .contains('Search')
      .click();

    cy.get('.gm-style').should('exist');
  });

  it('TSOF4.3 TSDF4.4 should search with the settings', function() {
    cy
      .get('button[type="submit"]')
      .contains('Search')
      .click();

    cy.get('.event-preview').should('have.length.above', 0);
  });
});
