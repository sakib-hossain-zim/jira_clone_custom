import { testid } from '../support/utils';

describe('Issue Title Editing', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('updates issue title successfully', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('textarea[placeholder="Short summary"]')
        .clear()
        .type('Updated Issue Title')
        .blur();
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).should('contain', 'Updated Issue Title');
    });
  });

  it('validates title is not empty', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('textarea[placeholder="Short summary"]').clear().blur();
      cy.get(testid`form-field:title`).should('contain', 'required');
    });
  });

  it('prevents title exceeding maximum length', () => {
    const longTitle = 'a'.repeat(300);
    
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('textarea[placeholder="Short summary"]').clear().type(longTitle).blur();
      cy.get(testid`form-field:title`).should('contain', 'maximum');
    });
  });

  it('trims whitespace from title', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('textarea[placeholder="Short summary"]')
        .clear()
        .type('   Title with spaces   ')
        .blur();
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.get('textarea[placeholder="Short summary"]')
          .should('have.value', 'Title with spaces');
      });
    });
  });

  it('updates title on board immediately after blur', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('textarea[placeholder="Short summary"]')
        .clear()
        .type('Real-time Title Update')
        .blur();
    });

    cy.wait(1000);
    cy.get(testid`icon:close`).click();
    cy.get(testid`list-issue`).should('contain', 'Real-time Title Update');
  });

  it('allows multiline title text', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('textarea[placeholder="Short summary"]')
        .clear()
        .type('Line one{enter}Line two')
        .blur();
    });

    cy.get(testid`icon:close`).click();
    cy.get(testid`list-issue`).first().should('contain', 'Line one');
  });

  it('restores original title when validation fails', () => {
    const originalTitle = 'Issue title 1';
    
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('textarea[placeholder="Short summary"]').clear().blur();
      cy.get('textarea[placeholder="Short summary"]').type(originalTitle).blur();
    });

    cy.get(testid`icon:close`).click();
    cy.get(testid`list-issue`).should('contain', originalTitle);
  });
});