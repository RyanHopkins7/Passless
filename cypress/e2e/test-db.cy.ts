import { verify } from "crypto";

describe('Database testing functions', () => {

  it('Create User', () => {
    // Assign test-id to login submission form and use test-id to insert values into form and submit
    cy.visit('http://localhost:3000/');
    cy.intercept('**/api/users').as('updateUsers');

    cy.get('input[placeholder*="Full Name"]').type('test name')
    cy.get('input[placeholder*="Email Address"]').type('test1@gmail.com')
    cy.get('#authentication-form').submit();

    cy.wait('@updateUsers');

    // Upon submission, query the database for the user you designated for test submission and ensure that it exists
    cy.task('queryDB', `
        SELECT email FROM users
        WHERE email = "test1@gmail.com"
    `).then((emails : any) => {
        expect(emails[0]).to.exist;
        expect(emails.length).to.eq(1);
    })

    // Upon submission, check that path redirects user to /devices
    cy.location().should((loc) => {
        expect(loc.pathname).to.eq('/devices');
    })
  })

  it('Create duplicate user', () => {

    // Assign test-id to login submission form and use test-id to insert values into form and submit
    cy.visit('http://localhost:3000/');
    cy.get('input[placeholder*="Full Name"]').type('new test name') // Unique user name
    cy.get('input[placeholder*="Email Address"]').type('test1@gmail.com') // Same email
    cy.get('#authentication-form').submit();

    // Upon submission, query the database for the same user and assert that username has not been changed
    cy.task('queryDB', `
    SELECT user_name as username
    FROM users
    WHERE email = "test1@gmail.com"
    `).then((usernames : any) => {
        expect(usernames[0].username).to.eq('test name');
        expect(usernames.length).to.eq(1);
    })
  });
  
  it('Add Password', () => {

    cy.visit('http://localhost:3000/');
    
    // Login to user, then add a password
    cy.get('#swap-form').click();
    // Ensure the added password exists on user's end

    // Refresh page, ensure added password still exists (tests server side)
  });

  it('Reset Database', () => {
    // Reset the database for future testing
    cy.task('resetDB');
  })

  
})