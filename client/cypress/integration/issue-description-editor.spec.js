import { testid } from '../support/utils';

describe('Issue Description Editor', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('adds description to issue without description', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a description...').click().should('not.exist');
      cy.get('.ql-editor').type('This is a new description');
      cy.contains('button', 'Save').click();
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.get('.ql-editor').should('contain', 'This is a new description');
      });
    });
  });

  it('edits existing issue description', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a description...').click();
      cy.get('.ql-editor').type('Original description');
      cy.contains('button', 'Save').click();
    });

    cy.get(testid`icon:close`).click();
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('.ql-editor').click();
      cy.get('.ql-editor').clear().type('Updated description');
      cy.contains('button', 'Save').click();
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.get('.ql-editor').should('contain', 'Updated description');
        cy.get('.ql-editor').should('not.contain', 'Original description');
      });
    });
  });

  it('cancels description editing', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a description...').click();
      cy.get('.ql-editor').type('Temporary description');
      cy.contains('button', 'Cancel').click();
      cy.contains('Add a description...').should('exist');
    });
  });

  it('applies rich text formatting to description', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a description...').click();
      
      cy.get('.ql-editor').type('Bold text');
      cy.get('.ql-editor').type('{selectall}');
      cy.get('.ql-bold').click();
      
      cy.contains('button', 'Save').click();
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.get('.ql-editor strong').should('exist');
      });
    });
  });

  it('saves description with multiple paragraphs', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a description...').click();
      cy.get('.ql-editor').type('First paragraph{enter}Second paragraph{enter}Third paragraph');
      cy.contains('button', 'Save').click();
    });

    cy.assertReloadAssert(() => {
      cy.get(testid`list-issue`).first().click();
      cy.get(testid`modal:issue-details`).within(() => {
        cy.get('.ql-editor').should('contain', 'First paragraph');
        cy.get('.ql-editor').should('contain', 'Second paragraph');
        cy.get('.ql-editor').should('contain', 'Third paragraph');
      });
    });
  });

  it('clears description completely', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a description...').click();
      cy.get('.ql-editor').type('Description to be removed');
      cy.contains('button', 'Save').click();
    });

    cy.get(testid`icon:close`).click();
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('.ql-editor').click().clear();
      cy.contains('button', 'Save').click();
      cy.contains('Add a description...').should('exist');
    });
  });
});