import { testid } from '../support/utils';

describe('Data Consistency', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('maintains issue count consistency after creation', () => {
    cy.get(testid`list-issue`).then($issues => {
      const initialCount = $issues.length;

      cy.visit('/project/board?modal-issue-create=true');

      cy.get(testid`modal:issue-create`).within(() => {
        cy.selectOption('type', 'Task');
        cy.get('input[name="title"]').type('NEW_ISSUE');
        cy.get('button[type="submit"]').click();
      });

      cy.get(testid`list-issue`).should('have.length', initialCount + 1);
    });
  });

  it('maintains issue count consistency after deletion', () => {
    cy.get(testid`list-issue`).then($issues => {
      const initialCount = $issues.length;

      cy.get(testid`list-issue`).first().click();

      cy.get(testid`modal:issue-details`)
        .find(`button ${testid`icon:trash`}`)
        .click();

      cy.get(testid`modal:confirm`)
        .contains('button', 'Delete issue')
        .click();

      cy.get(testid`list-issue`).should('have.length', initialCount - 1);
    });
  });

  it('ensures issue appears in only one status column', () => {
    const issueTitle = 'Issue title 1';

    cy.get(testid`list-issue`).contains(issueTitle).click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('status', 'Done');
    });

    cy.get(testid`icon:close`).click();

    cy.get(testid`board-list:done`).should('contain', issueTitle);
    cy.get(testid`board-list:backlog`).should('not.contain', issueTitle);
    cy.get(testid`board-list:selected`).should('not.contain', issueTitle);
    cy.get(testid`board-list:inprogress`).should('not.contain', issueTitle);
  });

  it('ensures deleted comments do not reappear', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a comment...').click();
      cy.get('textarea[placeholder="Add a comment..."]').type('COMMENT_TO_DELETE');
      cy.contains('button', 'Save').click();
    });

    cy.get(testid`issue-comment`).contains('COMMENT_TO_DELETE')
      .parents(testid`issue-comment`)
      .contains('Delete')
      .click();

    cy.get(testid`modal:confirm`)
      .contains('button', 'Delete comment')
      .click();

    cy.get(testid`icon:close`).click();
    cy.reload();
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get(testid`issue-comment`).should('not.contain', 'COMMENT_TO_DELETE');
    });
  });

  it('ensures time tracking updates are consistent', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('input[placeholder="Number"]').first().type('20');
      cy.contains('20h estimated').click();
    });

    cy.get(testid`modal:tracking`).within(() => {
      cy.get('input[placeholder="Number"]').eq(0).type('10');
      cy.get('input[placeholder="Number"]').eq(1).type('5');
      cy.contains('button', 'Done').click();
    });

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('20h estimated').should('exist');
      cy.contains('10h logged').should('exist');
      cy.contains('5h remaining').should('exist');
    });

    cy.get(testid`icon:close`).click();
    cy.reload();
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('20h estimated').should('exist');
      cy.contains('10h logged').should('exist');
      cy.contains('5h remaining').should('exist');
    });
  });

  it('ensures assignee changes are reflected on board immediately', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Gaben');
    });

    cy.wait(500);
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().within(() => {
      cy.get(testid`avatar:Gaben`).should('exist');
    });
  });

  it('ensures filter results match actual issue properties', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Yoda');
    });

    cy.get(testid`icon:close`).click();

    cy.get(testid`board-filters`).find(testid`avatar:Yoda`).click();

    cy.get(testid`list-issue`).each($issue => {
      cy.wrap($issue).should('have.descendants', testid`avatar:Yoda`);
    });
  });

  it('ensures search results are accurate', () => {
    const uniqueTitle = 'UNIQUE_SEARCH_TERM_12345';

    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type(uniqueTitle);
      cy.get('button[type="submit"]').click();
    });

    cy.get(testid`board-filters`).find('input').type(uniqueTitle);

    cy.get(testid`list-issue`).should('have.length', 1);
    cy.get(testid`list-issue`).should('contain', uniqueTitle);
  });

  it('ensures priority changes are reflected correctly', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('priority', 'Highest');
    });

    cy.wait(500);
    cy.get(testid`icon:close`).click();
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectShouldContain('priority', 'Highest');
    });
  });

  it('ensures type changes update icons correctly', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('type', 'Story');
    });

    cy.wait(500);
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().within(() => {
      cy.get(testid`icon:story`).should('exist');
      cy.get(testid`icon:task`).should('not.exist');
      cy.get(testid`icon:bug`).should('not.exist');
    });
  });

  it('ensures column counts update after moving issues', () => {
    cy.get(testid`board-list:backlog`).within(() => {
      cy.get('h3').invoke('text').then(text => {
        const backlogCount = parseInt(text.match(/\d+/)[0]);

        cy.get(testid`list-issue`).first().click();

        cy.get(testid`modal:issue-details`).within(() => {
          cy.selectOption('status', 'Done');
        });

        cy.get(testid`icon:close`).click();

        cy.get(testid`board-list:backlog`).within(() => {
          cy.get('h3').should('contain', backlogCount - 1);
        });
      });
    });
  });

  it('ensures reporter assignment is persistent', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('reporter', 'Pickle Rick');
    });

    cy.wait(500);
    cy.get(testid`icon:close`).click();
    cy.reload();
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectShouldContain('reporter', 'Pickle Rick');
    });
  });

  it('ensures description updates are saved correctly', () => {
    const description = 'This is a test description that should be saved';

    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a description...').click();
      cy.get('.ql-editor').type(description);
      cy.contains('button', 'Save').click();
    });

    cy.get(testid`icon:close`).click();
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('.ql-editor').should('contain', description);
    });
  });
});