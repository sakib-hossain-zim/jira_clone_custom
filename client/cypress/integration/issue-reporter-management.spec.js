import { testid } from '../support/utils';

describe('Issue Reporter Management', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('changes issue reporter', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('reporter', 'Yoda');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.selectShouldContain('reporter', 'Yoda');
      });
    });
  });

  it('displays reporter avatar in issue details', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('reporter', 'Pickle Rick');
      cy.get(testid`select:reporter`).should('contain', 'Pickle Rick');
    });
  });

  it('sets reporter when creating new issue', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('NEW_ISSUE_WITH_REPORTER');
      cy.selectOption('reporterId', 'Yoda');
      cy.get('button[type="submit"]').click();
    });

    cy.contains(testid`list-issue`, 'NEW_ISSUE_WITH_REPORTER').click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectShouldContain('reporter', 'Yoda');
    });
  });

  it('defaults reporter to current user on issue creation', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectShouldContain('reporterId', 'Lord Gaben');
    });
  });

  it('maintains reporter when changing other properties', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('reporter', 'Pickle Rick');
      cy.selectOption('status', 'Done');
      cy.selectOption('priority', 'High');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`board-list:done`).contains(testid`list-issue`, 'Issue title 1').click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.selectShouldContain('reporter', 'Pickle Rick');
      });
    });
  });

  it('shows all available users in reporter dropdown', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get(testid`select:reporter`).click();
      cy.contains('Lord Gaben').should('exist');
      cy.contains('Pickle Rick').should('exist');
      cy.contains('Yoda').should('exist');
    });
  });
});