import { testid } from '../support/utils';

describe('Priority Levels', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('sets issue priority to Highest', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('priority', 'Highest');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.selectShouldContain('priority', 'Highest');
      });
    });
  });

  it('sets issue priority to High', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('priority', 'High');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.selectShouldContain('priority', 'High');
      });
    });
  });

  it('sets issue priority to Medium', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('priority', 'Medium');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.selectShouldContain('priority', 'Medium');
      });
    });
  });

  it('sets issue priority to Low', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('priority', 'Low');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.selectShouldContain('priority', 'Low');
      });
    });
  });

  it('sets issue priority to Lowest', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('priority', 'Lowest');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.selectShouldContain('priority', 'Lowest');
      });
    });
  });

  it('displays all priority options in dropdown', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get(testid`select:priority`).click();
      cy.contains('Highest').should('exist');
      cy.contains('High').should('exist');
      cy.contains('Medium').should('exist');
      cy.contains('Low').should('exist');
      cy.contains('Lowest').should('exist');
    });
  });

  it('shows priority icon for Highest', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('priority', 'Highest');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().within(() => {
      cy.get(testid`icon:arrow-up`).should('exist');
    });
  });

  it('shows priority icon for Low', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('priority', 'Low');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().within(() => {
      cy.get(testid`icon:arrow-down`).should('exist');
    });
  });

  it('creates issue with specific priority', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Bug');
      cy.get('input[name="title"]').type('CRITICAL_BUG');
      cy.selectOption('priority', 'Highest');
      cy.get('button[type="submit"]').click();
    });

    cy.contains(testid`list-issue`, 'CRITICAL_BUG').click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectShouldContain('priority', 'Highest');
    });
  });

  it('changes priority multiple times', () => {
    cy.get(testid`list-issue`).first().click();

    const priorities = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
    
    priorities.forEach(priority => {
      cy.get(testid`modal:issue-details`).within(() => {
        cy.selectOption('priority', priority);
        cy.wait(300);
        cy.selectShouldContain('priority', priority);
      });
    });
  });

  it('preserves priority when changing other properties', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('priority', 'Highest');
      cy.selectOption('status', 'Done');
      cy.selectOption('type', 'Bug');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`board-list:done`).contains(testid`list-issue`, 'Issue title 1').click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.selectShouldContain('priority', 'Highest');
      });
    });
  });
});