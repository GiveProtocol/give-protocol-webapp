describe('Donation Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.login(); // Custom command for authentication
  });

  it('completes a successful donation', () => {
    // Browse charities
    cy.get('[data-testid="charity-card"]').first().click();

    // Fill donation form
    cy.get('[data-testid="donation-amount"]').type('10');
    cy.get('[data-testid="donation-submit"]').click();

    // Connect wallet if needed
    cy.get('[data-testid="connect-wallet"]').click();

    // Confirm transaction
    cy.get('[data-testid="confirm-transaction"]').click();

    // Verify success message
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Donation successful');

    // Verify donation appears in history
    cy.visit('/donor-portal');
    cy.get('[data-testid="donation-history"]')
      .should('contain', '10.00')
      .and('contain', 'Test Charity');
  });

  it('handles failed donations gracefully', () => {
    cy.intercept('POST', '/api/donations', {
      statusCode: 500,
      body: { error: 'Transaction failed' }
    });

    cy.get('[data-testid="charity-card"]').first().click();
    cy.get('[data-testid="donation-amount"]').type('10');
    cy.get('[data-testid="donation-submit"]').click();

    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Transaction failed');
  });

  it('validates donation amount', () => {
    cy.get('[data-testid="charity-card"]').first().click();
    
    // Test invalid amounts
    cy.get('[data-testid="donation-amount"]').type('-10');
    cy.get('[data-testid="donation-submit"]').should('be.disabled');

    cy.get('[data-testid="donation-amount"]').clear().type('0');
    cy.get('[data-testid="donation-submit"]').should('be.disabled');

    cy.get('[data-testid="donation-amount"]').clear().type('1000001');
    cy.get('[data-testid="donation-submit"]').should('be.disabled');

    // Test valid amount
    cy.get('[data-testid="donation-amount"]').clear().type('100');
    cy.get('[data-testid="donation-submit"]').should('be.enabled');
  });
});