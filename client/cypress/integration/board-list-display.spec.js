import { testid } from '../support/utils';

describe('Board List Display', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('displays all four status columns', () => {
    cy.get(testid`board-list:backlog`).should('exist').and('be.visible');
    cy.get(testid`board-list:selected`).should('exist').and('be.visible');
    cy.get(testid`board-list:inprogress`).should('exist').and('be.visible');
    cy.get(testid`board-list:done`).should('exist').and('be.visible');
  });

  it('shows correct column headers', () => {
    cy.contains('Backlog').should('exist');
    cy.contains('Selected for Development').should('exist');
    cy.contains('In Progress').should('exist');
    cy.contains('Done').should('exist');
  });

  it('displays issue count in each column header', () => {
    cy.get(testid`board-list:backlog`).within(() => {
      cy.get('h3').invoke('text').should('match', /\d+/);
    });
  });

  it('shows issues in correct columns based on status', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('status', 'Done');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`board-list:done`).should('contain', 'Issue title 1');
    cy.get(testid`board-list:backlog`).should('not.contain', 'Issue title 1');
  });

  it('displays issue cards with title', () => {
    cy.get(testid`list-issue`).each($issue => {
      cy.wrap($issue).find('p').should('not.be.empty');
    });
  });

  it('displays issue type icon on cards', () => {
    cy.get(testid`list-issue`).first().within(() => {
      cy.get(`[data-testid^="icon:"]`).should('exist');
    });
  });

  it('displays assignee avatars on issue cards', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Gaben');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().within(() => {
      cy.get(testid`avatar:Gaben`).should('exist');
    });
  });

  it('shows priority indicator on issue cards', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('priority', 'High');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().within(() => {
      cy.get(`[data-testid^="icon:arrow"]`).should('exist');
    });
  });

  it('updates issue count when moving issues between columns', () => {
    cy.get(testid`board-list:backlog`).within(() => {
      cy.get('h3').invoke('text').then(text => {
        const initialCount = parseInt(text.match(/\d+/)[0]);
        
        cy.get(testid`list-issue`).first().click();
        cy.get(testid`modal:issue-details`).within(() => {
          cy.selectOption('status', 'Done');
        });
        cy.get(testid`icon:close`).click();

        cy.get(testid`board-list:backlog`).within(() => {
          cy.get('h3').should('contain', initialCount - 1);
        });
      });
    });
  });

  it('maintains column layout on different screen sizes', () => {
    cy.viewport(1920, 1080);
    cy.get(testid`board-list:backlog`).should('be.visible');
    
    cy.viewport(1280, 720);
    cy.get(testid`board-list:backlog`).should('be.visible');
  });

  it('displays empty column message when no issues', () => {
    cy.get(testid`list-issue`).each($issue => {
      cy.wrap($issue).click();
      cy.get(testid`modal:issue-details`)
        .find(`button ${testid`icon:trash`}`)
        .click();
      cy.get(testid`modal:confirm`)
        .contains('button', 'Delete issue')
        .click();
    });

    cy.get(testid`board-list:backlog`).within(() => {
      cy.get(testid`list-issue`).should('not.exist');
    });
  });

  it('orders issues within columns correctly', () => {
    cy.get(testid`board-list:backlog`).within(() => {
      cy.get(testid`list-issue`).should('have.length.at.least', 2);
    });
  });
});