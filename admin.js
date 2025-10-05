/*
 * admin.js
 *
 * Handles the teacher portal functionality: verifying authentication,
 * submitting point adjustments and refreshing the scoreboard and updates
 * lists. It relies on the functions exposed by script.js through
 * window.housePoints.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Redirect to login page if not authenticated
  if (sessionStorage.getItem('loggedIn') !== 'true') {
    window.location.href = 'login.html';
    return;
  }
  const { updateHousePoints, renderScoreboard, renderUpdates } = window.housePoints;
  // Initially render the scoreboard and updates
  renderScoreboard('scoreboard');
  renderUpdates('updatesList');
  // Handle submission of new points
  const addBtn = document.getElementById('addPointsBtn');
  addBtn.addEventListener('click', () => {
    const houseSelect = document.getElementById('houseSelect');
    const pointsInput = document.getElementById('pointsInput');
    const reasonInput = document.getElementById('reasonInput');
    const house = houseSelect.value;
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
    updateHousePoints(house, delta, reason);
    // Clear input fields
    pointsInput.value = '';
    reasonInput.value = '';
    // Re-render scoreboard and updates
    renderScoreboard('scoreboard');
    renderUpdates('updatesList');
  });
  // Handle log out
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', event => {
    event.preventDefault();
    sessionStorage.removeItem('loggedIn');
    window.location.href = 'index.html';
  });
});