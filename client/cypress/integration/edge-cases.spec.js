import { testid } from '../support/utils';

describe('Edge Cases', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('handles very long issue titles', () => {
    const longTitle = 'a'.repeat(200);
    
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('textarea[placeholder="Short summary"]')
        .clear()
        .type(longTitle)
        .blur();
    });

    cy.get(testid`icon:close`).click();
    cy.get(testid`list-issue`).first().should('contain', 'aaa');
  });

  it('handles issue with no assignees', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('NO_ASSIGNEE');
      cy.get('button[type="submit"]').click();
    });

    cy.contains(testid`list-issue`, 'NO_ASSIGNEE').within(() => {
      cy.get(testid`avatar`).should('not.exist');
    });
  });

  it('handles deleting last issue in column', () => {
    cy.get(testid`board-list:backlog`)
      .find(testid`list-issue`)
      .each(($issue) => {
        cy.wrap($issue).click();
        cy.get(testid`modal:issue-details`)
          .find(`button ${testid`icon:trash`}`)
          .click();
        cy.get(testid`modal:confirm`)
          .contains('button', 'Delete issue')
          .click();
        cy.wait(500);
      });

    cy.get(testid`board-list:backlog`)
      .find(testid`list-issue`)
      .should('not.exist');
  });

  it('handles rapid status changes', () => {
    cy.get(testid`list-issue`).first().click();

    const statuses = ['Selected for Development', 'In Progress', 'Done', 'Backlog'];
    
    statuses.forEach(status => {
      cy.get(testid`modal:issue-details`).within(() => {
        cy.selectOption('status', status);
        cy.wait(200);
      });
    });

    cy.get(testid`icon:close`).click();
    cy.get(testid`board-list:backlog`).should('contain', 'Issue title 1');
  });

  it('handles multiple simultaneous modal operations', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('input[placeholder="Number"]').first().type('10');
      cy.contains('10h estimated').click();
    });

    cy.get(testid`modal:tracking`).should('be.visible');
    cy.get(testid`modal:issue-details`).should('be.visible');
  });

  it('handles empty search with filters applied', () => {
    cy.get(testid`board-filters`).find('input').type('NonExistent');
    cy.get(testid`board-filters`).find(testid`avatar:Gaben`).click();
    
    cy.get(testid`list-issue`).should('not.exist');
  });

  it('handles creating issue with special characters in title', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Bug');
      cy.get('input[name="title"]').type('Special <>&"\'`chars!@#$%^&*()');
      cy.get('button[type="submit"]').click();
    });

    cy.get(testid`list-issue`).should('contain', 'Special');
  });

  it('handles issue with very long description', () => {
    const longDescription = 'Lorem ipsum dolor sit amet. '.repeat(100);
    
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a description...').click();
      cy.get('.ql-editor').type(longDescription);
      cy.contains('button', 'Save').click();
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.get('.ql-editor').should('contain', 'Lorem ipsum');
      });
    });
  });

  it('handles network error gracefully', () => {
    cy.intercept('PUT', '/api/issues/*', { forceNetworkError: true });

    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('textarea[placeholder="Short summary"]')
        .clear()
        .type('Network Error Test')
        .blur();
    });

    cy.wait(1000);
  });

  it('handles browser back button during modal operations', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).should('be.visible');

    cy.go('back');
    cy.get(testid`modal:issue-details`).should('not.exist');

    cy.go('forward');
    cy.get(testid`modal:issue-details`).should('be.visible');
  });

  it('handles zero time estimates', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('input[placeholder="Number"]').first().type('0').blur();
    });

    cy.wait(500);
    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('estimated').should('not.exist');
    });
  });

  it('handles comment with only whitespace', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a comment...').click();
      cy.get('textarea[placeholder="Add a comment..."]').type('     ');
      cy.contains('button', 'Save').should('be.disabled');
    });
  });

  it('handles rapid filter toggling', () => {
    for (let i = 0; i < 10; i++) {
      cy.get(testid`board-filters`).find(testid`avatar:Gaben`).click();
      cy.wait(100);
    }

    cy.get(testid`list-issue`).should('have.length.at.least', 1);
  });

  it('handles maximum number of assignees', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Gaben', 'Yoda', 'Pickle Rick');
    });

    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().within(() => {
      cy.get(testid`avatar`).should('have.length', 3);
    });
  });
});