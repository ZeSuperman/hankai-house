/*
 * login.js
 *
 * Handles teacher authentication for the Hankai House Points website.
 * A very simple client‑side login system is used for demonstration
 * purposes. In a real deployment this should be replaced with a secure
 * server‑side authentication mechanism.
 */

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect straight to admin portal
  if (sessionStorage.getItem('loggedIn') === 'true') {
    window.location.href = 'admin.html';
    return;
  }
  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    // Hard‑coded credentials; in a real app use server side auth
    const validUser = 'teacher';
    const validPass = 'hankai123';
    if (username === validUser && password === validPass) {
      sessionStorage.setItem('loggedIn', 'true');
      errorEl.style.display = 'none';
      window.location.href = 'admin.html';
    } else {
      errorEl.textContent = 'Invalid username or password. Please try again.';
      errorEl.style.display = 'block';
    }
  });
});