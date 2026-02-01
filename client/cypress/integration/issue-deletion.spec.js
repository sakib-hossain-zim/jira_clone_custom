import { testid } from '../support/utils';

describe('Issue Deletion', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('shows delete confirmation modal when clicking delete button', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`)
      .find(`button ${testid`icon:trash`}`)
      .click();

    cy.get(testid`modal:confirm`).within(() => {
      cy.contains('Are you sure you want to delete this issue?').should('exist');
      cy.contains('button', 'Delete issue').should('exist');
      cy.contains('button', 'Cancel').should('exist');
    });
  });

  it('cancels issue deletion', () => {
    const issueTitle = 'Issue title 1';
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`)
      .find(`button ${testid`icon:trash`}`)
      .click();

    cy.get(testid`modal:confirm`)
      .contains('button', 'Cancel')
      .click();

    cy.get(testid`modal:confirm`).should('not.exist');
    cy.get(testid`modal:issue-details`).should('exist');
    cy.get(testid`icon:close`).click();
    cy.get(testid`list-issue`).should('contain', issueTitle);
  });

  it('deletes issue with comments', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a comment...').click();
      cy.get('textarea[placeholder="Add a comment..."]').type('Comment before deletion');
      cy.contains('button', 'Save').click();
    });

    cy.get(testid`modal:issue-details`)
      .find(`button ${testid`icon:trash`}`)
      .click();

    cy.get(testid`modal:confirm`)
      .contains('button', 'Delete issue')
      .click();

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).should('not.contain', 'Issue title 1');
    });
  });

  it('removes issue from board after deletion', () => {
    const issueCount = Cypress.$(`[data-testid="list-issue"]`).length;

    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`)
      .find(`button ${testid`icon:trash`}`)
      .click();

    cy.get(testid`modal:confirm`)
      .contains('button', 'Delete issue')
      .click();

    cy.get(testid`list-issue`).should('have.length', issueCount - 1);
  });

  it('closes modal after successful deletion', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`)
      .find(`button ${testid`icon:trash`}`)
      .click();

    cy.get(testid`modal:confirm`)
      .contains('button', 'Delete issue')
      .click();

    cy.get(testid`modal:issue-details`).should('not.exist');
    cy.get(testid`modal:confirm`).should('not.exist');
  });

  it('deletes issue from specific status column', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('status', 'In Progress');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`board-list:inprogress`).contains(testid`list-issue`, 'Issue title 1').click();

    cy.get(testid`modal:issue-details`)
      .find(`button ${testid`icon:trash`}`)
      .click();

    cy.get(testid`modal:confirm`)
      .contains('button', 'Delete issue')
      .click();

    cy.assertReloadAssert(() => {
      cy.get(testid`board-list:inprogress`).should('not.contain', 'Issue title 1');
    });
  });

  it('maintains other issues after deletion', () => {
    cy.get(testid`list-issue`).should('have.length.at.least', 3);

    cy.get(testid`list-issue`).eq(1).click();

    cy.get(testid`modal:issue-details`)
      .find(`button ${testid`icon:trash`}`)
      .click();

    cy.get(testid`modal:confirm`)
      .contains('button', 'Delete issue')
      .click();

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).should('have.length.at.least', 2);
    });
  });
});