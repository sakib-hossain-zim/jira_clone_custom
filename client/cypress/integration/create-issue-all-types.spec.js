import { testid } from '../support/utils';

describe('Create Issue - All Types', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
  });

  it('creates Task issue with minimum required fields', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('NEW_TASK');
      cy.get('button[type="submit"]').click();
    });

    cy.get(testid`modal:issue-create`).should('not.exist');
    cy.contains(testid`list-issue`, 'NEW_TASK').should('exist');
  });

  it('creates Bug issue with all fields', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Bug');
      cy.get('input[name="title"]').type('CRITICAL_BUG');
      cy.get('.ql-editor').type('This is a critical bug that needs immediate attention');
      cy.selectOption('reporterId', 'Yoda');
      cy.selectOption('userIds', 'Gaben', 'Yoda');
      cy.selectOption('priority', 'Highest');
      cy.get('button[type="submit"]').click();
    });

    cy.contains(testid`list-issue`, 'CRITICAL_BUG').click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectShouldContain('type', 'Bug');
      cy.get('textarea[placeholder="Short summary"]').should('have.value', 'CRITICAL_BUG');
      cy.get('.ql-editor').should('contain', 'critical bug');
      cy.selectShouldContain('reporter', 'Yoda');
      cy.selectShouldContain('assignees', 'Gaben', 'Yoda');
      cy.selectShouldContain('priority', 'Highest');
    });
  });

  it('creates Story issue with description', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Story');
      cy.get('input[name="title"]').type('USER_STORY');
      cy.get('.ql-editor').type('As a user, I want to be able to...');
      cy.get('button[type="submit"]').click();
    });

    cy.contains(testid`list-issue`, 'USER_STORY').click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('.ql-editor').should('contain', 'As a user');
    });
  });

  it('creates issue with single assignee', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('SINGLE_ASSIGNEE');
      cy.selectOption('userIds', 'Gaben');
      cy.get('button[type="submit"]').click();
    });

    cy.contains(testid`list-issue`, 'SINGLE_ASSIGNEE').within(() => {
      cy.get(testid`avatar:Gaben`).should('exist');
    });
  });

  it('creates issue with multiple assignees', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('MULTIPLE_ASSIGNEES');
      cy.selectOption('userIds', 'Gaben', 'Yoda', 'Pickle Rick');
      cy.get('button[type="submit"]').click();
    });

    cy.contains(testid`list-issue`, 'MULTIPLE_ASSIGNEES').within(() => {
      cy.get(testid`avatar:Gaben`).should('exist');
      cy.get(testid`avatar:Yoda`).should('exist');
      cy.get(testid`avatar:Pickle Rick`).should('exist');
    });
  });

  it('creates issue without assignees', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('UNASSIGNED_ISSUE');
      cy.get('button[type="submit"]').click();
    });

    cy.contains(testid`list-issue`, 'UNASSIGNED_ISSUE').within(() => {
      cy.get(testid`avatar`).should('not.exist');
    });
  });

  it('creates issue with custom reporter', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Bug');
      cy.get('input[name="title"]').type('CUSTOM_REPORTER');
      cy.selectOption('reporterId', 'Pickle Rick');
      cy.get('button[type="submit"]').click();
    });

    cy.contains(testid`list-issue`, 'CUSTOM_REPORTER').click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectShouldContain('reporter', 'Pickle Rick');
    });
  });

  it('creates issue with High priority', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Bug');
      cy.get('input[name="title"]').type('HIGH_PRIORITY');
      cy.selectOption('priority', 'High');
      cy.get('button[type="submit"]').click();
    });

    cy.contains(testid`list-issue`, 'HIGH_PRIORITY').click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectShouldContain('priority', 'High');
    });
  });

  it('shows success message after creating issue', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('SUCCESS_MESSAGE_TEST');
      cy.get('button[type="submit"]').click();
    });

    cy.contains('Issue has been successfully created.').should('exist');
  });

  it('redirects to board after creating issue', () => {
    cy.visit('/project/settings?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('REDIRECT_TEST');
      cy.get('button[type="submit"]').click();
    });

    cy.location('pathname').should('equal', '/project/board');
  });

  it('creates issue and appears in correct status column', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('BACKLOG_ISSUE');
      cy.get('button[type="submit"]').click();
    });

    cy.get(testid`board-list:backlog`).should('contain', 'BACKLOG_ISSUE');
  });
});