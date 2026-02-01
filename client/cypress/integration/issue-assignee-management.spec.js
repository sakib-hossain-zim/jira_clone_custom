import { testid } from '../support/utils';

describe('Issue Assignee Management', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('assigns single user to unassigned issue', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Gaben');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().within(() => {
        cy.get(testid`avatar:Gaben`).should('exist');
      });
    });
  });

  it('assigns multiple users to issue', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Gaben', 'Yoda', 'Pickle Rick');
    });

    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().within(() => {
      cy.get(testid`avatar:Gaben`).should('exist');
      cy.get(testid`avatar:Yoda`).should('exist');
      cy.get(testid`avatar:Pickle Rick`).should('exist');
    });
  });

  it('removes all assignees from issue', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Gaben');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get(testid`select:assignees`).within(() => {
        cy.get(testid`select-option:Gaben`).click();
      });
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().within(() => {
        cy.get(testid`avatar`).should('not.exist');
      });
    });
  });

  it('replaces assignees with different users', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Gaben');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get(testid`select:assignees`).within(() => {
        cy.get(testid`select-option:Gaben`).click();
      });
      cy.selectOption('assignees', 'Yoda', 'Pickle Rick');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().within(() => {
        cy.get(testid`avatar:Gaben`).should('not.exist');
        cy.get(testid`avatar:Yoda`).should('exist');
        cy.get(testid`avatar:Pickle Rick`).should('exist');
      });
    });
  });

  it('filters board by assigned user', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Gaben');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`board-filters`).within(() => {
      cy.get(testid`avatar:Gaben`).click();
    });

    cy.get(testid`list-issue`).each($issue => {
      cy.wrap($issue).should('have.descendants', testid`avatar:Gaben`);
    });
  });

  it('displays assignee avatars in correct order', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Yoda', 'Gaben', 'Pickle Rick');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().within(() => {
      cy.get(testid`avatar`).should('have.length', 3);
    });
  });
});