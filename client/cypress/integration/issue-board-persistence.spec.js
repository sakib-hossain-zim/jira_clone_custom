import { testid } from '../support/utils';

describe('Issue Board Persistence', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('persists issue status change after page reload', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('status', 'Done');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`board-list:done`).should('contain', 'Issue title 1');
      cy.get(testid`board-list:backlog`).should('not.contain', 'Issue title 1');
    });
  });

  it('persists issue title change after page reload', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('textarea[placeholder="Short summary"]')
        .clear()
        .type('PERSISTED_TITLE')
        .blur();
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).should('contain', 'PERSISTED_TITLE');
    });
  });

  it('persists assignee changes after page reload', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Gaben', 'Yoda');
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().within(() => {
        cy.get(testid`avatar:Gaben`).should('exist');
        cy.get(testid`avatar:Yoda`).should('exist');
      });
    });
  });

  it('persists comments after page reload', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a comment...').click();
      cy.get('textarea[placeholder="Add a comment..."]').type('PERSISTED_COMMENT');
      cy.contains('button', 'Save').click();
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.get(testid`issue-comment`).should('contain', 'PERSISTED_COMMENT');
      });
    });
  });

  it('persists time tracking after page reload', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('input[placeholder="Number"]').first().type('15');
      cy.contains('15h estimated').click();
    });

    cy.get(testid`modal:tracking`).within(() => {
      cy.get('input[placeholder="Number"]').eq(0).type('5');
      cy.contains('button', 'Done').click();
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.contains('15h estimated').should('exist');
        cy.contains('5h logged').should('exist');
      });
    });
  });

  it('persists issue deletion after page reload', () => {
    cy.get(testid`list-issue`).first().click();

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

  it('persists comment deletion after page reload', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a comment...').click();
      cy.get('textarea[placeholder="Add a comment..."]').type('TO_BE_DELETED');
      cy.contains('button', 'Save').click();
    });

    cy.get(testid`icon:close`).click();
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get(testid`issue-comment`).contains('TO_BE_DELETED')
        .parents(testid`issue-comment`)
        .contains('Delete')
        .click();
    });

    cy.get(testid`modal:confirm`)
      .contains('button', 'Delete comment')
      .click();

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.get(testid`issue-comment`).should('not.contain', 'TO_BE_DELETED');
      });
    });
  });

  it('persists new issue creation after page reload', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('NEWLY_CREATED_ISSUE');
      cy.get('button[type="submit"]').click();
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).should('contain', 'NEWLY_CREATED_ISSUE');
    });
  });

  it('persists issue type change after page reload', () => {
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

  it('persists priority change after page reload', () => {
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

  it('persists reporter change after page reload', () => {
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

  it('persists description after page reload', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a description...').click();
      cy.get('.ql-editor').type('This description should persist');
      cy.contains('button', 'Save').click();
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.get('.ql-editor').should('contain', 'This description should persist');
      });
    });
  });
});