/*
 * admin.js
 *
 * Handles the teacher portal functionality: verifying authentication,
 * submitting point adjustments and refreshing the scoreboard and updates
 * lists. It relies on the functions exposed by script.js through
 * window.housePoints.
 */

document.addEventListener('DOMContentLoaded', () => {
  const { updateHousePoints, renderScoreboard, renderUpdates, undoLastUpdate, resetAllPoints } = window.housePoints;
  // Determine role and user from session storage
  const role = sessionStorage.getItem('role');
  const username = sessionStorage.getItem('username');
  const house = sessionStorage.getItem('house');
  // If not authenticated, redirect to login
  if (!role) {
    window.location.href = 'login.html';
    return;
  }
  // DOM elements
  const actionsLeftEl = document.getElementById('actionsLeft');
  const addBtn = document.getElementById('addPointsBtn');
  const undoBtn = document.getElementById('undoBtn');
  const resetBtn = document.getElementById('resetBtn');
  const adminActionsContainer = document.getElementById('adminActions');
  const logoutBtn = document.getElementById('logoutBtn');
  const welcomeEl = document.getElementById('welcomeMsg');
  // Render initial scoreboard and updates
  renderScoreboard('scoreboard');
  renderUpdates('updatesList');

  // Set welcome message based on role
  if (welcomeEl) {
    if (role === 'admin') {
      welcomeEl.textContent = 'Welcome Admin';
    } else {
      welcomeEl.textContent = `Welcome ${username} of ${house}`;
    }
  }
  /**
   * Compute a storage key for tracking teacher point totals per day. Uses
   * the action type ("added" or "deducted"), normalized username and
   * current date. This allows us to cap how many points a teacher can
   * award or deduct in a single day. Admins are exempt from these
   * limits.
   *
   * @param {string} type - Either 'added' or 'deducted'
   * @returns {string}    - The generated localStorage key
   */
  function pointsKey(type) {
    const date = new Date().toISOString().slice(0, 10); // YYYY‑MM‑DD
    const normalized = username ? username.toLowerCase().replace(/\s+/g, '') : '';
    return `${type}_${normalized}_${date}`;
  }

  /**
   * Get the total number of points added by this teacher today.
   */
  function currentAdded() {
    return parseInt(localStorage.getItem(pointsKey('added'))) || 0;
  }

  /**
   * Get the total number of points deducted by this teacher today (stored as
   * positive numbers).
   */
  function currentDeducted() {
    return parseInt(localStorage.getItem(pointsKey('deducted'))) || 0;
  }

  /**
   * Update the display showing how many points a teacher has left to
   * award or deduct today. For teachers, the daily cap is 200 points
   * added and 200 points deducted. Admins do not see this.
   */
  function updateActionsDisplay() {
    if (role === 'admin') return;
    const addRemaining = 200 - currentAdded();
    const deductRemaining = 200 - currentDeducted();
    actionsLeftEl.style.display = 'block';
    actionsLeftEl.textContent = `Points left today – Add: ${addRemaining} pts, Deduct: ${deductRemaining} pts`;
    // Disable the add button if both limits are exhausted
    addBtn.disabled = addRemaining <= 0 && deductRemaining <= 0;
  }

  /**
   * Attempt to record a points adjustment for this teacher. Returns
   * true if the adjustment is within the daily cap, false otherwise. A
   * positive delta counts towards the 'added' total and a negative delta
   * (its absolute value) counts towards the 'deducted' total. Admins
   * always return true.
   *
   * @param {number} delta - The number of points being applied (can be negative)
   * @returns {boolean}   - Whether the operation is allowed
   */
  function recordPoints(delta) {
    if (role === 'admin') return true;
    const amount = Math.abs(delta);
    if (delta > 0) {
      const used = currentAdded();
      if (used + amount > 200) {
        return false;
      }
      localStorage.setItem(pointsKey('added'), used + amount);
      return true;
    } else {
      const used = currentDeducted();
      if (used + amount > 200) {
        return false;
      }
      localStorage.setItem(pointsKey('deducted'), used + amount);
      return true;
    }
  }
  // Role specific setup
  if (role === 'admin') {
    // Show admin actions (undo/reset)
    adminActionsContainer.style.display = 'block';
  } else {
    // Teacher: show remaining actions and disable own house
    updateActionsDisplay();
    if (house) {
      const select = document.getElementById('houseSelect');
      Array.from(select.options).forEach(opt => {
        if (opt.value === house) {
          opt.textContent = `${opt.value} (Your House)`;
          opt.disabled = true;
        }
      });
    }
  }
  // Handle submission of new points
  addBtn.addEventListener('click', () => {
    const houseSelect = document.getElementById('houseSelect');
    const pointsInput = document.getElementById('pointsInput');
    const reasonInput = document.getElementById('reasonInput');
    const selectedHouse = houseSelect.value;
    const delta = parseInt(pointsInput.value, 10);
    const reason = reasonInput.value.trim();
    if (isNaN(delta) || delta === 0) {
      alert('Please enter a non‑zero numeric value for points.');
      return;
    }
    if (!reason) {
      alert('Please provide a brief reason for the adjustment.');
      return;
    }
    // Teachers are limited to 200 points added and 200 points deducted per day
    if (role !== 'admin') {
      const allowed = recordPoints(delta);
      if (!allowed) {
        if (delta > 0) {
          alert('Daily limit reached: you cannot add more than 200 points today.');
        } else {
          alert('Daily limit reached: you cannot deduct more than 200 points today.');
        }
        return;
      }
    }
    // Update points, passing teacher name if not admin
    const actor = role === 'admin' ? undefined : username;
    const success = updateHousePoints(selectedHouse, delta, reason, actor);
    if (success && role !== 'admin') {
      // Update the actions display to reflect new totals
      updateActionsDisplay();
    }
    // Clear input fields
    pointsInput.value = '';
    reasonInput.value = '';
    // Re-render scoreboard and updates
    renderScoreboard('scoreboard');
    renderUpdates('updatesList');
  });
  // Admin controls
  if (role === 'admin') {
    undoBtn.addEventListener('click', () => {
      const undone = undoLastUpdate();
      if (!undone) {
        alert('No updates to undo.');
      }
      renderScoreboard('scoreboard');
      renderUpdates('updatesList');
    });
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all house points?')) {
        resetAllPoints();
        renderScoreboard('scoreboard');
        renderUpdates('updatesList');
      }
    });
  }
  // Logout handler: clear all session keys
  if (logoutBtn) {
    logoutBtn.addEventListener('click', event => {
      event.preventDefault();
      sessionStorage.clear();
      window.location.href = 'index.html';
    });
  }
});