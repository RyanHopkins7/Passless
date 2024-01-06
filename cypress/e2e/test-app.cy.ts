describe('General application tests', () => {

    // TODO: Create user to be logged into
    
    it('Login to Correct User', () => {
    
        // Swap to login page from home page and login with a valid email
        cy.visit('http://localhost:3000/');
    
        cy.intercept('POST', '**/api/webauthn/credential/reg-opts').as('webauthnCall');
        
        cy.get('#swap-form').click();
        cy.get('input[placeholder*="Email Address"]').type('test1@gmail.com');
        cy.get('#authentication-form').submit();
    
        // Upon submission, ensure that call to login was validated
        cy.wait('@webauthnCall').then((interception) => {
            console.log('Request: ' + interception.request);
            console.log('Response: ' + interception.response);
        })
      });

    it('Reset DB', () => {
        // Reset the database for future testing
        cy.task('resetDB');
    })
})