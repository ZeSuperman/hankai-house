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
  // Render initial scoreboard and updates
  renderScoreboard('scoreboard');
  renderUpdates('updatesList');
  /**
   * Compute key for tracking teacher actions per day. Uses normalized
   * username (lowercase, no spaces) and current date.
   */
  function actionKey() {
    const date = new Date().toISOString().slice(0, 10); // YYYY‑MM‑DD
    const normalized = username ? username.toLowerCase().replace(/\s+/g, '') : '';
    return `count_${normalized}_${date}`;
  }
  /**
   * Get number of remaining actions for the current teacher today.
   * Teachers are limited to five actions per day. Admins have no limit.
   */
  function remainingActions() {
    if (role === 'admin') return Infinity;
    const used = parseInt(localStorage.getItem(actionKey())) || 0;
    return Math.max(0, 5 - used);
  }
  /**
   * Update the actions left display and disable the submit button if
   * necessary. Only applies to teachers.
   */
  function updateActionsDisplay() {
    if (role === 'admin') return;
    const remaining = remainingActions();
    actionsLeftEl.style.display = 'block';
    actionsLeftEl.textContent = `Actions left today: ${remaining}`;
    addBtn.disabled = remaining <= 0;
  }
  /**
   * Increment the action count for the current teacher for today.
   */
  function incrementActionCount() {
    if (role === 'admin') return;
    const key = actionKey();
    const used = parseInt(localStorage.getItem(key)) || 0;
    localStorage.setItem(key, used + 1);
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
    // Teachers are limited to five actions per day
    if (role !== 'admin' && remainingActions() <= 0) {
      alert('You have reached your daily limit of five actions.');
      return;
    }
    // Update points, passing teacher name if not admin
    const actor = role === 'admin' ? undefined : username;
    const success = updateHousePoints(selectedHouse, delta, reason, actor);
    if (success && role !== 'admin') {
      incrementActionCount();
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
  logoutBtn.addEventListener('click', event => {
    event.preventDefault();
    sessionStorage.clear();
    window.location.href = 'index.html';
  });
});