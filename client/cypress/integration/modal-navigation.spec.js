import { testid } from '../support/utils';

describe('Modal Navigation', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('opens issue details modal from board', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).should('be.visible');
    cy.location('search').should('contain', 'modal-issue-details');
  });

  it('closes issue details modal with close button', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).should('be.visible');
    cy.get(testid`icon:close`).click();
    cy.get(testid`modal:issue-details`).should('not.exist');
    cy.location('search').should('not.contain', 'modal-issue-details');
  });

  it('closes modal with escape key', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).should('be.visible');
    cy.get('body').type('{esc}');
    cy.get(testid`modal:issue-details`).should('not.exist');
  });

  it('opens create issue modal from query parameter', () => {
    cy.visit('/project/board?modal-issue-create=true');
    cy.get(testid`modal:issue-create`).should('be.visible');
  });

  it('opens issue details modal from query parameter', () => {
    cy.get(testid`list-issue`).first().invoke('attr', 'data-issue-id').then(issueId => {
      cy.visit(`/project/board?modal-issue-details=${issueId}`);
      cy.get(testid`modal:issue-details`).should('be.visible');
    });
  });

  it('maintains modal state when refreshing page', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).should('be.visible');
    
    cy.reload();
    
    cy.get(testid`modal:issue-details`).should('be.visible');
  });

  it('closes modal when clicking backdrop', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).should('be.visible');
    
    cy.get('body').click(0, 0);
    cy.get(testid`modal:issue-details`).should('not.exist');
  });

  it('opens issue search modal from query parameter', () => {
    cy.visit('/project/board?modal-issue-search=true');
    cy.get(testid`modal:issue-search`).should('be.visible');
  });

  it('prevents body scroll when modal is open', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get('body').should('have.css', 'overflow', 'hidden');
  });

  it('restores body scroll when modal closes', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`icon:close`).click();
    cy.get('body').should('not.have.css', 'overflow', 'hidden');
  });

  it('navigates between issues using browser back/forward', () => {
    cy.get(testid`list-issue`).eq(0).click();
    cy.get(testid`modal:issue-details`).should('contain', 'Issue title 1');
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).eq(1).click();
    cy.get(testid`modal:issue-details`).should('exist');
    
    cy.go('back');
    cy.get(testid`modal:issue-details`).should('not.exist');
    
    cy.go('forward');
    cy.get(testid`modal:issue-details`).should('exist');
  });

  it('opens tracking modal from issue details', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('input[placeholder="Number"]').first().type('10');
      cy.contains('10h estimated').click();
    });

    cy.get(testid`modal:tracking`).should('be.visible');
  });

  it('opens confirmation modal when deleting issue', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`)
      .find(`button ${testid`icon:trash`}`)
      .click();
    cy.get(testid`modal:confirm`).should('be.visible');
  });
});