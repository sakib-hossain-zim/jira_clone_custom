import { testid } from '../support/utils';

describe('Search Functionality', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('filters issues by partial title match', () => {
    cy.get(testid`board-filters`).find('input').type('Issue title');
    cy.get(testid`list-issue`).should('have.length.at.least', 1);
    cy.get(testid`list-issue`).each($issue => {
      cy.wrap($issue).should('contain', 'Issue title');
    });
  });

  it('search is case insensitive', () => {
    cy.get(testid`board-filters`).find('input').type('ISSUE TITLE');
    cy.get(testid`list-issue`).should('have.length.at.least', 1);
  });

  it('clears search and shows all issues', () => {
    cy.get(testid`board-filters`).find('input').type('Issue title 1');
    cy.get(testid`list-issue`).should('have.length', 1);
    
    cy.get(testid`board-filters`).find('input').clear();
    cy.get(testid`list-issue`).should('have.length.at.least', 3);
  });

  it('shows no results for non-matching search', () => {
    cy.get(testid`board-filters`).find('input').type('NonExistentIssue123');
    cy.get(testid`list-issue`).should('not.exist');
  });

  it('searches across all status columns', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('status', 'Done');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`board-filters`).find('input').type('Issue title 1');
    cy.get(testid`board-list:done`).should('contain', 'Issue title 1');
  });

  it('updates results in real-time as typing', () => {
    cy.get(testid`board-filters`).find('input').type('Issue');
    cy.get(testid`list-issue`).should('have.length.at.least', 3);
    
    cy.get(testid`board-filters`).find('input').type(' title 1');
    cy.get(testid`list-issue`).should('have.length', 1);
  });

  it('maintains search when navigating to issue details and back', () => {
    cy.get(testid`board-filters`).find('input').type('Issue title 1');
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`icon:close`).click();
    
    cy.get(testid`board-filters`).find('input').should('have.value', 'Issue title 1');
    cy.get(testid`list-issue`).should('have.length', 1);
  });

  it('searches by issue description content', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.contains('Add a description...').click();
      cy.get('.ql-editor').type('unique description keyword');
      cy.contains('button', 'Save').click();
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`board-filters`).find('input').type('unique description');
    cy.get(testid`list-issue`).should('have.length', 1);
  });

  it('combines search with user filter', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Gaben');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`board-filters`).find('input').type('Issue');
    cy.get(testid`board-filters`).find(testid`avatar:Gaben`).click();
    
    cy.get(testid`list-issue`).should('have.length.at.least', 1);
  });

  it('handles special characters in search', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('textarea[placeholder="Short summary"]')
        .clear()
        .type('Issue with $pecial @characters!')
        .blur();
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`board-filters`).find('input').type('$pecial');
    cy.get(testid`list-issue`).should('contain', '$pecial');
  });

  it('trims whitespace from search query', () => {
    cy.get(testid`board-filters`).find('input').type('   Issue title 1   ');
    cy.get(testid`list-issue`).should('have.length', 1);
  });
});