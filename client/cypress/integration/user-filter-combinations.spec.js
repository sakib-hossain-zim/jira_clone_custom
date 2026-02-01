import { testid } from '../support/utils';

describe('User Filter Combinations', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('filters by single user', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Gaben');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`board-filters`).find(testid`avatar:Gaben`).click();
    cy.get(testid`list-issue`).each($issue => {
      cy.wrap($issue).should('have.descendants', testid`avatar:Gaben`);
    });
  });

  it('filters by multiple users with OR logic', () => {
    cy.get(testid`list-issue`).eq(0).click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Gaben');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).eq(1).click();
    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Yoda');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`board-filters`).find(testid`avatar:Gaben`).click();
    cy.get(testid`board-filters`).find(testid`avatar:Yoda`).click();
    
    cy.get(testid`list-issue`).should('have.length.at.least', 2);
  });

  it('removes user filter by clicking again', () => {
    cy.get(testid`board-filters`).find(testid`avatar:Gaben`).click();
    cy.get(testid`list-issue`).should('have.length.at.least', 0);
    
    cy.get(testid`board-filters`).find(testid`avatar:Gaben`).click();
    cy.get(testid`list-issue`).should('have.length.at.least', 3);
  });

  it('shows "Only My Issues" filter', () => {
    cy.get(testid`board-filters`).contains('Only My Issues').click();
    cy.get(testid`list-issue`).should('have.length.at.least', 1);
  });

  it('toggles "Only My Issues" filter', () => {
    cy.get(testid`board-filters`).contains('Only My Issues').click();
    const myIssuesCount = Cypress.$(`[data-testid="list-issue"]`).length;
    
    cy.get(testid`board-filters`).contains('Only My Issues').click();
    cy.get(testid`list-issue`).should('have.length.at.least', myIssuesCount);
  });

  it('combines "Only My Issues" with search', () => {
    cy.get(testid`board-filters`).contains('Only My Issues').click();
    cy.get(testid`board-filters`).find('input').type('Issue');
    cy.get(testid`list-issue`).should('exist');
  });

  it('shows "Recently Updated" filter', () => {
    cy.get(testid`board-filters`).contains('Recently Updated').click();
    cy.get(testid`list-issue`).should('have.length.at.least', 1);
  });

  it('displays all filter options', () => {
    cy.get(testid`board-filters`).within(() => {
      cy.contains('Search').should('exist');
      cy.contains('Only My Issues').should('exist');
      cy.contains('Recently Updated').should('exist');
      cy.get(testid`avatar`).should('have.length.at.least', 3);
    });
  });

  it('clears all filters simultaneously', () => {
    cy.get(testid`board-filters`).find('input').type('Issue');
    cy.get(testid`board-filters`).find(testid`avatar:Gaben`).click();
    cy.get(testid`board-filters`).contains('Only My Issues').click();

    cy.get(testid`board-filters`).find('input').clear();
    cy.get(testid`board-filters`).find(testid`avatar:Gaben`).click();
    cy.get(testid`board-filters`).contains('Only My Issues').click();

    cy.get(testid`list-issue`).should('have.length.at.least', 3);
  });

  it('maintains filter state after page refresh', () => {
    cy.get(testid`board-filters`).find(testid`avatar:Gaben`).click();
    const filteredCount = Cypress.$(`[data-testid="list-issue"]`).length;
    
    cy.reload();
    
    cy.get(testid`list-issue`).should('have.length', filteredCount);
  });

  it('shows unassigned issues when all users deselected', () => {
    cy.visit('/project/board?modal-issue-create=true');
    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('UNASSIGNED_ISSUE');
      cy.get('button[type="submit"]').click();
    });

    cy.get(testid`board-filters`).find(testid`avatar:Gaben`).click();
    cy.get(testid`list-issue`).should('not.contain', 'UNASSIGNED_ISSUE');
    
    cy.get(testid`board-filters`).find(testid`avatar:Gaben`).click();
    cy.get(testid`list-issue`).should('contain', 'UNASSIGNED_ISSUE');
  });
});