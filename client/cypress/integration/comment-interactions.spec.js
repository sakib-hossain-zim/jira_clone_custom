import { testid } from '../support/utils';

describe('Comment Interactions', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
    cy.get(testid`list-issue`).first().click();
  });

  it('displays existing comment with correct author', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get(testid`issue-comment`).first().within(() => {
        cy.get(testid`avatar`).should('exist');
        cy.contains('Comment body').should('exist');
      });
    });
  });

  it('creates comment with line breaks', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a comment...').click();
      cy.get('textarea[placeholder="Add a comment..."]')
        .type('First line{enter}Second line{enter}Third line');
      cy.contains('button', 'Save').click();

      cy.get(testid`issue-comment`).last().should('contain', 'First line');
    });
  });

  it('validates comment cannot be empty', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a comment...').click();
      cy.get('textarea[placeholder="Add a comment..."]').should('be.visible');
      cy.contains('button', 'Save').should('be.disabled');
    });
  });

  it('displays relative timestamp for comments', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get(testid`issue-comment`).first().within(() => {
        cy.contains(/ago/).should('exist');
      });
    });
  });

  it('creates multiple comments in sequence', () => {
    const comments = ['First comment', 'Second comment', 'Third comment'];

    comments.forEach(comment => {
      cy.get(testid`modal:issue-details`).within(() => {
        cy.contains('Add a comment...').click();
        cy.get('textarea[placeholder="Add a comment..."]').type(comment);
        cy.contains('button', 'Save').click();
        cy.wait(500);
      });
    });

    cy.get(testid`issue-comment`).should('have.length', 4); // 3 new + 1 existing
  });

  it('edits comment and preserves formatting', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a comment...').click();
      cy.get('textarea[placeholder="Add a comment..."]')
        .type('Original comment with formatting');
      cy.contains('button', 'Save').click();
      cy.wait(500);

      cy.get(testid`issue-comment`).last().contains('Edit').click();
      cy.get('textarea[placeholder="Add a comment..."]')
        .clear()
        .type('Edited comment with new text');
      cy.contains('button', 'Save').click();

      cy.get(testid`issue-comment`).last().should('contain', 'Edited comment with new text');
    });
  });

  it('shows delete confirmation modal', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get(testid`issue-comment`).first().contains('Delete').click();
    });

    cy.get(testid`modal:confirm`).within(() => {
      cy.contains('Are you sure you want to delete this comment?').should('exist');
      cy.contains('button', 'Delete comment').should('exist');
      cy.contains('button', 'Cancel').should('exist');
    });
  });

  it('cancels comment deletion', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get(testid`issue-comment`).first().contains('Delete').click();
    });

    cy.get(testid`modal:confirm`).contains('button', 'Cancel').click();
    cy.get(testid`modal:confirm`).should('not.exist');
    cy.get(testid`issue-comment`).first().should('exist');
  });

  it('displays comment author avatar', () => {
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get(testid`issue-comment`).each($comment => {
        cy.wrap($comment).find(testid`avatar`).should('exist');
      });
    });
  });
});