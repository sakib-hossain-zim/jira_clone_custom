import { testid } from '../support/utils';

describe('Project Settings Validation', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.createTestAccount();
    cy.visit('/project/settings');
  });

  it('validates project name is required', () => {
    cy.get('input[name="name"]').clear();
    cy.get('button[type="submit"]').click();
    cy.get(testid`form-field:name`).should('contain', 'This field is required');
  });

  it('validates project name maximum length', () => {
    const longName = 'a'.repeat(150);
    cy.get('input[name="name"]').clear().type(longName);
    cy.get('button[type="submit"]').click();
    cy.get(testid`form-field:name`).should('contain', 'maximum');
  });

  it('validates URL format', () => {
    cy.get('input[name="url"]').clear().type('invalid-url-format');
    cy.get('button[type="submit"]').click();
    cy.get(testid`form-field:url`).should('contain', 'valid URL');
  });

  it('accepts valid URL with http protocol', () => {
    cy.get('input[name="url"]').clear().type('http://example.com');
    cy.get('button[type="submit"]').click();
    cy.contains('Changes have been saved successfully.').should('exist');
  });

  it('accepts valid URL with https protocol', () => {
    cy.get('input[name="url"]').clear().type('https://secure-example.com');
    cy.get('button[type="submit"]').click();
    cy.contains('Changes have been saved successfully.').should('exist');
  });

  it('allows empty URL field', () => {
    cy.get('input[name="url"]').clear();
    cy.get('button[type="submit"]').click();
    cy.contains('Changes have been saved successfully.').should('exist');
  });

  it('validates description maximum length', () => {
    const longDescription = 'a'.repeat(2000);
    cy.get('textarea[name="description"]').clear().type(longDescription);
    cy.get('button[type="submit"]').click();
    cy.get(testid`form-field:description`).should('contain', 'maximum');
  });

  it('allows empty description', () => {
    cy.get('textarea[name="description"]').clear();
    cy.get('button[type="submit"]').click();
    cy.contains('Changes have been saved successfully.').should('exist');
  });

  it('trims whitespace from project name', () => {
    cy.get('input[name="name"]').clear().type('   Trimmed Name   ');
    cy.get('button[type="submit"]').click();
    
    cy.reload();
    cy.get('input[name="name"]').should('have.value', 'Trimmed Name');
  });

  it('shows all available categories in dropdown', () => {
    cy.get(testid`select:category`).click();
    cy.contains('Software').should('exist');
    cy.contains('Marketing').should('exist');
    cy.contains('Business').should('exist');
  });

  it('updates multiple fields simultaneously', () => {
    cy.get('input[name="name"]').clear().type('Updated Project');
    cy.get('input[name="url"]').clear().type('https://updated.com');
    cy.get('textarea[name="description"]').clear().type('Updated description');
    cy.selectOption('category', 'Marketing');
    cy.get('button[type="submit"]').click();

    cy.contains('Changes have been saved successfully.').should('exist');

    cy.reload();
    cy.get('input[name="name"]').should('have.value', 'Updated Project');
    cy.get('input[name="url"]').should('have.value', 'https://updated.com');
    cy.get('textarea[name="description"]').should('have.value', 'Updated description');
    cy.selectShouldContain('category', 'Marketing');
  });

  it('shows error for invalid URL with spaces', () => {
    cy.get('input[name="url"]').clear().type('http://example with spaces.com');
    cy.get('button[type="submit"]').click();
    cy.get(testid`form-field:url`).should('contain', 'valid URL');
  });

  it('accepts URL with subdomain', () => {
    cy.get('input[name="url"]').clear().type('https://sub.domain.example.com');
    cy.get('button[type="submit"]').click();
    cy.contains('Changes have been saved successfully.').should('exist');
  });

  it('accepts URL with path', () => {
    cy.get('input[name="url"]').clear().type('https://example.com/path/to/project');
    cy.get('button[type="submit"]').click();
    cy.contains('Changes have been saved successfully.').should('exist');
  });

  it('accepts URL with query parameters', () => {
    cy.get('input[name="url"]').clear().type('https://example.com?param=value');
    cy.get('button[type="submit"]').click();
    cy.contains('Changes have been saved successfully.').should('exist');
  });
});