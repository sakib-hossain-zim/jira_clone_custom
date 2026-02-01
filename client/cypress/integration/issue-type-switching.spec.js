import { testid } from '../support/utils';

describe('Issue Type Switching', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('changes issue type from Task to Bug', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('type', 'Bug');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().within(() => {
        cy.get(testid`icon:bug`).should('exist');
      });
    });
  });

  it('changes issue type from Bug to Story', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('type', 'Bug');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('type', 'Story');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().within(() => {
        cy.get(testid`icon:story`).should('exist');
      });
    });
  });

  it('changes issue type from Story to Task', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('type', 'Story');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('type', 'Task');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().within(() => {
        cy.get(testid`icon:task`).should('exist');
      });
    });
  });

  it('displays correct icon for Task type', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('TEST_TASK');
      cy.get('button[type="submit"]').click();
    });

    cy.contains(testid`list-issue`, 'TEST_TASK').within(() => {
      cy.get(testid`icon:task`).should('exist');
    });
  });

  it('displays correct icon for Bug type', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Bug');
      cy.get('input[name="title"]').type('TEST_BUG');
      cy.get('button[type="submit"]').click();
    });

    cy.contains(testid`list-issue`, 'TEST_BUG').within(() => {
      cy.get(testid`icon:bug`).should('exist');
    });
  });

  it('displays correct icon for Story type', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Story');
      cy.get('input[name="title"]').type('TEST_STORY');
      cy.get('button[type="submit"]').click();
    });

    cy.contains(testid`list-issue`, 'TEST_STORY').within(() => {
      cy.get(testid`icon:story`).should('exist');
    });
  });

  it('preserves other properties when changing type', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Gaben');
      cy.selectOption('priority', 'High');
      cy.selectOption('status', 'In Progress');
      cy.selectOption('type', 'Bug');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.selectShouldContain('assignees', 'Gaben');
        cy.selectShouldContain('priority', 'High');
        cy.selectShouldContain('status', 'In Progress');
        cy.selectShouldContain('type', 'Bug');
      });
    });
  });

  it('shows all available issue types in dropdown', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get(testid`select:type`).click();
      cy.contains('Task').should('exist');
      cy.contains('Bug').should('exist');
      cy.contains('Story').should('exist');
    });
  });

  it('updates icon immediately after type change', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('type', 'Bug');
    });

    cy.wait(500);
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().within(() => {
      cy.get(testid`icon:bug`).should('exist');
    });
  });

  it('maintains type selection in create modal', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Story');
      cy.selectShouldContain('type', 'Story');
    });
  });
});