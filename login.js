/*
 * login.js
 *
 * Handles teacher authentication for the Hankai House Points website.
 * A very simple client‑side login system is used for demonstration
 * purposes. In a real deployment this should be replaced with a secure
 * server‑side authentication mechanism.
 */

/**
 * login.js
 *
 * Provides a simple client‑side authentication mechanism for the
 * Hankai House Points website. This script differentiates between
 * administrators and teachers. Administrators have full control over
 * the scoreboard (they can award or deduct unlimited points, undo the
 * last update and reset all scores). Teachers can only award or
 * deduct points for houses other than their own and are limited to
 * five actions per day. Credentials are hard‑coded for demo
 * purposes. In a production environment you should replace this
 * logic with a secure server‑side system.
 */

// Map of teacher usernames (lowercase, no spaces) to their house
const TEACHERS = {
  // Ra house teachers
  colin: { house: 'Ra' },
  linna: { house: 'Ra' },
  nino: { house: 'Ra' },
  ban: { house: 'Ra' },
  mayuka: { house: 'Ra' },
  tracy: { house: 'Ra' },
  risy: { house: 'Ra' },
  yvonne: { house: 'Ra' },
  elina: { house: 'Ra' },
  stefanie: { house: 'Ra' },
  alicia: { house: 'Ra' },
  fulla: { house: 'Ra' },
  rebecca: { house: 'Ra' },
  vicky: { house: 'Ra' },
  loong: { house: 'Ra' },
  coraline: { house: 'Ra' },
  shabbir: { house: 'Ra' },
  graham: { house: 'Ra' },
  eric: { house: 'Ra' },
  // Athena house teachers
  shel: { house: 'Athena' },
  tenny: { house: 'Athena' },
  krystal: { house: 'Athena' },
  luna: { house: 'Athena' },
  emily: { house: 'Athena' },
  fiona: { house: 'Athena' },
  'sunnyyang': { house: 'Athena' },
  yuyu: { house: 'Athena' },
  julie: { house: 'Athena' },
  iritsu: { house: 'Athena' },
  tammy: { house: 'Athena' },
  winnie: { house: 'Athena' },
  nancy: { house: 'Athena' },
  lydia: { house: 'Athena' },
  noku: { house: 'Athena' },
  joan: { house: 'Athena' },
  daniel: { house: 'Athena' },
  daicen: { house: 'Athena' },
  lea: { house: 'Athena' },
  // Awilix house teachers
  claire: { house: 'Awilix' },
  phyllis: { house: 'Awilix' },
  alice: { house: 'Awilix' },
  sierra: { house: 'Awilix' },
  serena: { house: 'Awilix' },
  james: { house: 'Awilix' },
  nicole: { house: 'Awilix' },
  amy: { house: 'Awilix' },
  'sunnyfeng': { house: 'Awilix' },
  ollie: { house: 'Awilix' },
  sherry: { house: 'Awilix' },
  leo: { house: 'Awilix' },
  jasmine: { house: 'Awilix' },
  violet: { house: 'Awilix' },
  'dongzihan': { house: 'Awilix' },
  tarek: { house: 'Awilix' },
  donovan: { house: 'Awilix' },
  roopak: { house: 'Awilix' },
  // Odin house teachers
  joy: { house: 'Odin' },
  sophie: { house: 'Odin' },
  lotus: { house: 'Odin' },
  dean: { house: 'Odin' },
  jenny: { house: 'Odin' },
  mandy: { house: 'Odin' },
  merissa: { house: 'Odin' },
  yun: { house: 'Odin' },
  allen: { house: 'Odin' },
  linda: { house: 'Odin' },
  catherine: { house: 'Odin' },
  jane: { house: 'Odin' },
  rachel: { house: 'Odin' },
  bill: { house: 'Odin' },
  zoe: { house: 'Odin' },
  jonel: { house: 'Odin' },
  gerard: { house: 'Odin' },
  callum: { house: 'Odin' }
};

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in (role stored), redirect straight to portal
  if (sessionStorage.getItem('role')) {
    window.location.href = 'admin.html';
    return;
  }
  const form = document.getElementById('loginForm');
  const errorEl = document.getElementById('loginError');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const rawUsername = document.getElementById('username').value.trim();
    const normalized = rawUsername.toLowerCase().replace(/\s+/g, '');
    const password = document.getElementById('password').value;
    // Check admin credentials
    if (normalized === 'admin' && password === 'admin123') {
      sessionStorage.setItem('role', 'admin');
      sessionStorage.setItem('username', 'admin');
      // no house for admin
      errorEl.style.display = 'none';
      window.location.href = 'admin.html';
      return;
    }
    // Check teacher credentials
    const teacher = TEACHERS[normalized];
    if (teacher && password === 'teacher123') {
      sessionStorage.setItem('role', 'teacher');
      // store original name with proper case for display
      sessionStorage.setItem('username', rawUsername);
      sessionStorage.setItem('house', teacher.house);
      errorEl.style.display = 'none';
      window.location.href = 'admin.html';
      return;
    }
    // Invalid credentials
    errorEl.textContent = 'Invalid username or password. Please try again.';
    errorEl.style.display = 'block';
  });
});