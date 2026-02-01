import { testid } from '../support/utils';

describe('Time Tracking Validation', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
    cy.get(testid`list-issue`).first().click();
  });

  it('validates original estimate is a positive number', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('input[placeholder="Number"]').first().clear().type('-5').blur();
      cy.get('input[placeholder="Number"]').first().should('not.have.value', '-5');
    });
  });

  it('allows decimal values for time estimates', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('input[placeholder="Number"]').first().clear().type('2.5').blur();
      cy.wait(1000);
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.contains('2.5h estimated').should('exist');
      });
    });
  });

  it('clears time estimate when input is empty', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('input[placeholder="Number"]').first().type('10').blur();
      cy.wait(500);
      cy.get('input[placeholder="Number"]').first().clear().blur();
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.contains('estimated').should('not.exist');
      });
    });
  });

  it('prevents non-numeric input for time fields', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('input[placeholder="Number"]').first().type('abc');
      cy.get('input[placeholder="Number"]').first().should('have.value', '');
    });
  });

  it('updates tracking modal with spent and remaining time', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('input[placeholder="Number"]').first().type('20');
      cy.contains('20h estimated').click();
    });

    cy.get(testid`modal:tracking`).within(() => {
      cy.get('input[placeholder="Number"]').eq(0).type('8');
      cy.get('input[placeholder="Number"]').eq(1).type('10');
      cy.contains('button', 'Done').click();
    });

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('8h logged').should('exist');
      cy.contains('10h remaining').should('exist');
    });
  });

  it('calculates progress bar percentage correctly', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('input[placeholder="Number"]').first().type('10');
      cy.contains('10h estimated').click();
    });

    cy.get(testid`modal:tracking`).within(() => {
      cy.get('input[placeholder="Number"]').eq(0).type('5');
      cy.contains('button', 'Done').click();
    });

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('div[width="50"]').should('exist');
    });
  });

  it('shows 100% when logged time equals estimate', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('input[placeholder="Number"]').first().type('10');
      cy.contains('10h estimated').click();
    });

    cy.get(testid`modal:tracking`).within(() => {
      cy.get('input[placeholder="Number"]').eq(0).type('10');
      cy.contains('button', 'Done').click();
    });

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('div[width="100"]').should('exist');
    });
  });

  it('handles overtime logging correctly', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('input[placeholder="Number"]').first().type('10');
      cy.contains('10h estimated').click();
    });

    cy.get(testid`modal:tracking`).within(() => {
      cy.get('input[placeholder="Number"]').eq(0).type('15');
      cy.contains('button', 'Done').click();
    });

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('15h logged').should('exist');
      cy.get('div[width="100"]').should('exist');
    });
  });

  it('closes tracking modal without saving', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('input[placeholder="Number"]').first().type('10');
      cy.contains('10h estimated').click();
    });

    cy.get(testid`modal:tracking`).within(() => {
      cy.get('input[placeholder="Number"]').eq(0).type('5');
      cy.get(testid`icon:close`).click();
    });

    cy.get(testid`modal:tracking`).should('not.exist');
    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('No time logged').should('exist');
    });
  });
});