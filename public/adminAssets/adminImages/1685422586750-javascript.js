document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const message = document.getElementById('message');
  
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await fetch('/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
  
        if (response.ok) {
          const data = await response.json();
          message.textContent = 'Login successful';
          // Redirect the user to the dashboard or desired page
          // Example: window.location.href = '/dashboard';
        } else {
          const error = await response.json();
          message.textContent = error.error;
        }
      } catch (error) {
        console.error(error);
        message.textContent = 'An error occurred. Please try again.';
      }
    });
  });
  