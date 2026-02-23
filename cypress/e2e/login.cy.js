it('Debe permitir login con credenciales correctas', () => {
  cy.visit('/login')
  
  cy.get('input[placeholder="Usuario"]').type('u1@usco.edu.co')
  cy.get('input[placeholder="Contraseña"]').type('admin')
  
  cy.get('button[type="submit"]').click()
  
  cy.contains('Credenciales incorrectas').should('not.exist')
})
