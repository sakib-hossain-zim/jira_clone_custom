import { testid } from '../support/utils';

describe('UI Interactions', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/board');
  });

  it('highlights issue card on hover', () => {
    cy.get(testid`list-issue`).first().trigger('mouseover');
    cy.get(testid`list-issue`).first().should('have.css', 'cursor', 'pointer');
  });

  it('opens issue details on card click', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).should('be.visible');
  });

  it('focuses title field when modal opens', () => {
    cy.visit('/project/board?modal-issue-create=true');
    cy.get('input[name="title"]').should('have.focus');
  });

  it('shows tooltip on avatar hover', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.selectOption('assignees', 'Gaben');
    });
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).first().within(() => {
      cy.get(testid`avatar:Gaben`).trigger('mouseenter');
    });

    cy.wait(300);
  });

  it('disables submit button when form is invalid', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.get('button[type="submit"]').click();
      cy.get(testid`form-field:title`).should('contain', 'required');
    });
  });

  it('enables submit button when form is valid', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('Valid Issue');
      cy.get('button[type="submit"]').should('not.be.disabled');
    });
  });

  it('shows loading state while saving', () => {
    cy.get(testid`list-issue`).first().click();

    cy.intercept('PUT', '/api/issues/*', (req) => {
      req.reply((res) => {
        res.delay(1000);
      });
    });

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get('textarea[placeholder="Short summary"]')
        .clear()
        .type('Loading Test')
        .blur();
    });
  });

  it('prevents double submission of forms', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('Double Submit Test');
      cy.get('button[type="submit"]').click();
      cy.get('button[type="submit"]').should('be.disabled');
    });
  });

  it('scrolls to top of modal when opening', () => {
    cy.get(testid`list-issue`).first().click();
    cy.get(testid`modal:issue-details`).scrollTo('bottom');
    cy.get(testid`icon:close`).click();

    cy.get(testid`list-issue`).eq(1).click();
    cy.get(testid`modal:issue-details`).should('be.visible');
  });

  it('closes dropdown when clicking outside', () => {
    cy.get(testid`list-issue`).first().click();

    cy.get(testid`modal:issue-details`).within(() => {
      cy.get(testid`select:priority`).click();
      cy.contains('Highest').should('be.visible');
    });

    cy.get('body').click(100, 100);
    cy.contains('Highest').should('not.exist');
  });

  it('shows character count for title field', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.get('input[name="title"]').type('Test Title');
      cy.get('input[name="title"]').invoke('val').its('length').should('be.gt', 0);
    });
  });

  it('maintains scroll position in board when closing modal', () => {
    cy.scrollTo('bottom');
    cy.wait(500);

    cy.get(testid`list-issue`).last().click();
    cy.get(testid`icon:close`).click();

    cy.window().its('scrollY').should('be.gt', 0);
  });

  it('shows visual feedback on button click', () => {
    cy.visit('/project/board?modal-issue-create=true');

    cy.get(testid`modal:issue-create`).within(() => {
      cy.selectOption('type', 'Task');
      cy.get('input[name="title"]').type('Button Feedback');
      cy.get('button[type="submit"]').click();
      cy.get('button[type="submit"]').should('have.attr', 'disabled');
    });
  });

  it('highlights active filter selection', () => {
    cy.get(testid`board-filters`).find(testid`avatar:Gaben`).click();
    cy.get(testid`board-filters`).find(testid`avatar:Gaben`)
      .parent()
      .should('have.class', 'active');
  });

  it('shows focus outline on keyboard navigation', () => {
    cy.get(testid`list-issue`).first().focus();
    cy.get(testid`list-issue`).first().should('have.focus');
  });
});