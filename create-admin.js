const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rwlkcalyypszqvhtwvlq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3bGtjYWx5eXBzenF2aHR3dmxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2ODQ3MTcsImV4cCI6MjA5NjI2MDcxN30.l-016vh0btQMNvzZ49aIdekJJRAlJFR39azMLwCISWM'
);

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@cotolar.org.ar',
    password: 'Admin123!',
    options: {
      data: {
        nombre: 'Admin',
        apellido: 'Cotolar',
      }
    }
  });

  if (error) {
    console.error('Error creando admin:', error.message);
  } else {
    console.log('Usuario creado exitosamente:', data.user.email);
    console.log('¿Requiere confirmación de email?:', data.session === null);
  }
}

createAdmin();
