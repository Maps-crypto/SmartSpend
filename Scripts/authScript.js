// ---- Icon markup (swapped in/out for show/hide password) ----
const EYE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

function initPasswordToggles() {
  document.querySelectorAll('.toggle-visibility').forEach((btn) => {
    btn.innerHTML = EYE_ICON;
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      btn.innerHTML = isPassword ? EYE_OFF_ICON : EYE_ICON;
    });
  });
}

function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Placeholder for backend wiring (e.g. POST to /Account/Login in ASP.NET MVC).
    console.log('Login submitted:', {
      identifier: document.getElementById('login-identifier').value,
      password: document.getElementById('login-password').value,
      rememberMe: document.getElementById('remember-me').checked,
    });
    alert('Login form is ready to be wired up to the backend.');
  });
}

function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  const passwordInput = document.getElementById('register-password');
  const confirmInput = document.getElementById('register-confirm');
  const confirmField = confirmInput.closest('.field');

  function validateMatch() {
    if (confirmInput.value.length === 0) {
      confirmField.classList.remove('error');
      return true;
    }
    const matches = passwordInput.value === confirmInput.value;
    confirmField.classList.toggle('error', !matches);
    return matches;
  }

  passwordInput.addEventListener('input', validateMatch);
  confirmInput.addEventListener('input', validateMatch);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateMatch()) {
      confirmInput.focus();
      return;
    }
    // Placeholder for backend wiring (e.g. POST to /Account/Register in ASP.NET MVC).
    console.log('Register submitted:', {
      username: document.getElementById('register-username').value,
      email: document.getElementById('register-email').value,
      password: passwordInput.value,
    });
    alert('Registration form is ready to be wired up to the backend.');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggles();
  initLoginForm();
  initRegisterForm();
});
