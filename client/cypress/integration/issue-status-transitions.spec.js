import { testid } from '../support/utils';

describe('Issue Status Transitions', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('transitions issue through all statuses sequentially', () => {
    const statuses = ['Backlog', 'Selected for Development', 'In Progress', 'Done'];
    
    cy.get(testid`list-issue`).first().click();

    statuses.forEach((status, index) => {
      if (index > 0) {
        cy.get(testid`modal:issue-details`).within(() => {
          cy.selectOption('status', status);
        });
        cy.wait(500);
      }
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`board-list:done`).should('contain', 'Issue title 1');
    });
  });

  it('moves issue back from done to in progress', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('status', 'Done');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`board-list:done`).contains(testid`list-issue`, 'Issue title 1').click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('status', 'In Progress');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`board-list:inprogress`).should('contain', 'Issue title 1');
      cy.get(testid`board-list:done`).should('not.contain', 'Issue title 1');
    });
  });

  it('updates issue status via drag and drop', () => {
    const firstIssueTitle = 'Issue title 1';
    
    cy.get(testid`board-list:backlog`).contains(testid`list-issue`, firstIssueTitle)
      .trigger('dragstart');

    cy.get(testid`board-list:inprogress`)
      .trigger('drop');

    cy.assertReloadAssert(() => {
      cy.get(testid`board-list:inprogress`).should('contain', firstIssueTitle);
    });
  });

  it('preserves other issue properties when changing status', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('priority', 'High');
      cy.selectOption('assignees', 'Gaben', 'Yoda');
      cy.selectOption('status', 'Done');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`board-list:done`).contains(testid`list-issue`, 'Issue title 1').click();
      
      cy.get(testid`modal:issue-details`).within(() => {
        cy.selectShouldContain('priority', 'High');
        cy.selectShouldContain('assignees', 'Gaben', 'Yoda');
        cy.selectShouldContain('status', 'Done');
      });
    });
  });

  it('displays issue count per status column', () => {
    cy.get(testid`board-list:backlog`).within(() => {
      cy.get(testid`list-issue`).then($issues => {
        const count = $issues.length;
        cy.get('h3').should('contain', count > 0 ? count : '0');
      });
    });
  });
});