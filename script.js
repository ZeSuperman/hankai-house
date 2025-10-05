/*
 * Global script for Hankai House Points website.
 *
 * This module centralises all logic related to storing and updating
 * house point data in the browser's localStorage. It exposes helper
 * functions for rendering the scoreboard and recent updates, as well as
 * a public function to modify house points which can be invoked from
 * the teacher portal. The state persists across page reloads, meaning
 * adjustments made via the admin interface will reflect immediately on
 * the public scoreboard.
 */

// Retrieve a CSS variable from the root :root selector.
function getCSSVariable(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Default dataset for houses. If there is already data in localStorage
// this will not overwrite it. You can modify the initial values here if
// needed.
const DEFAULT_HOUSES = {
  'Odin': {
    points: 4500,
    colour: getCSSVariable('--colour-odin'),
    // Load images from the root because GitHub Pages serves assets from the repo root
    img: 'odin.jpeg'
  },
  'Athena': {
    points: 3800,
    colour: getCSSVariable('--colour-athena'),
    img: 'athena.jpeg'
  },
  'Ra': {
    points: 3200,
    colour: getCSSVariable('--colour-ra'),
    img: 'ra.jpg'
  },
  'Awilix': {
    points: 2990,
    colour: getCSSVariable('--colour-awilix'),
    img: 'awilix.jpg'
  }
};

// Initialise data if not present in localStorage.
function initData() {
  if (!localStorage.getItem('housesData')) {
    localStorage.setItem('housesData', JSON.stringify(DEFAULT_HOUSES));
  }
  if (!localStorage.getItem('updates')) {
    localStorage.setItem('updates', JSON.stringify([]));
  }
}

// Fetch houses object from localStorage.
function getHouses() {
  return JSON.parse(localStorage.getItem('housesData'));
}

// Persist houses object to localStorage.
function saveHouses(houses) {
  localStorage.setItem('housesData', JSON.stringify(houses));
}

// Fetch updates array from localStorage.
function getUpdates() {
  const raw = localStorage.getItem('updates');
  return raw ? JSON.parse(raw) : [];
}

// Persist updates array to localStorage.
function saveUpdates(updates) {
  localStorage.setItem('updates', JSON.stringify(updates));
}

/**
 * Update house points and log an update entry.
 *
 * @param {string} name    - House name
 * @param {number} delta   - Points to add (positive or negative)
 * @param {string} reason  - Reason for the change
 * @returns {boolean}      - True if update succeeded
 */
/**
 * Update house points and log an update entry.
 *
 * Optionally accepts the name of the teacher performing the update. When
 * provided, the teacher name is included in the updates list so that
 * administrators can see who made each change.
 *
 * @param {string} name    - House name
 * @param {number} delta   - Points to add (positive or negative)
 * @param {string} reason  - Reason for the change
 * @param {string} [teacher] - Name of the teacher performing the update
 * @returns {boolean}      - True if update succeeded
 */
function updateHousePoints(name, delta, reason, teacher) {
  const houses = getHouses();
  if (!houses[name]) {
    console.warn(`Attempted to update unknown house: ${name}`);
    return false;
  }
  // Update points
  houses[name].points += Number(delta);
  saveHouses(houses);
  // Create update log entry
  const updates = getUpdates();
  updates.unshift({
    house: name,
    delta: Number(delta),
    reason: reason || 'Update',
    teacher: teacher || null,
    timestamp: Date.now()
  });
  // Limit the updates list to the most recent 20 entries
  if (updates.length > 20) {
    updates.length = 20;
  }
  saveUpdates(updates);
  return true;
}

/**
 * Undo the last update entry. Removes the most recent update from the
 * log and reverses the corresponding points change.
 *
 * @returns {boolean} True if an update was undone, false if there was
 * nothing to undo
 */
function undoLastUpdate() {
  const updates = getUpdates();
  if (updates.length === 0) return false;
  const last = updates.shift();
  const houses = getHouses();
  if (houses[last.house]) {
    houses[last.house].points -= last.delta;
    saveHouses(houses);
  }
  saveUpdates(updates);
  return true;
}

/**
 * Reset all houses to their default point values and clear the updates
 * history. Useful at the start of a new academic year.
 */
function resetAllPoints() {
  const houses = getHouses();
  Object.keys(houses).forEach(name => {
    if (DEFAULT_HOUSES[name]) {
      houses[name].points = DEFAULT_HOUSES[name].points;
    }
  });
  saveHouses(houses);
  saveUpdates([]);
}

/**
 * Render the scoreboard into a container element. The scoreboard shows
 * each house sorted by points in descending order, with coloured
 * backgrounds and a subtle bar indicating the relative score against
 * the highest scoring house.
 *
 * @param {string} containerId - ID of the element where rows should be injected
 */
function renderScoreboard(containerId = 'scoreboard') {
  const container = document.getElementById(containerId);
  if (!container) return;
  const houses = getHouses();
  const names = Object.keys(houses);
  const maxPoints = Math.max(...names.map(n => houses[n].points));
  // Clear existing content
  container.innerHTML = '';
  // Sort descending by points
  names.sort((a, b) => houses[b].points - houses[a].points).forEach(name => {
    const { points, colour, img } = houses[name];
    // Create row
    const row = document.createElement('div');
    row.className = 'house-row';
    row.style.backgroundColor = colour;
    // Bar indicating relative score
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.width = maxPoints ? ((points / maxPoints) * 100).toFixed(2) + '%' : '0%';
    row.appendChild(bar);
    // Info container
    const info = document.createElement('div');
    info.className = 'info';
    const image = document.createElement('img');
    image.src = img;
    image.alt = `${name} logo`;
    const nameSpan = document.createElement('span');
    nameSpan.className = 'name';
    nameSpan.textContent = name;
    info.appendChild(image);
    info.appendChild(nameSpan);
    row.appendChild(info);
    // Points
    const pointsDiv = document.createElement('div');
    pointsDiv.className = 'points';
    pointsDiv.textContent = `${points} pts`;
    row.appendChild(pointsDiv);
    container.appendChild(row);
  });
}

/**
 * Render the recent updates list. Each entry displays the house name,
 * the points delta (with a plus sign if positive), the reason and a
 * formatted timestamp.
 *
 * @param {string} listId - ID of the <ul> element where updates should be injected
 */
function renderUpdates(listId = 'updatesList') {
  const list = document.getElementById(listId);
  if (!list) return;
  const updates = getUpdates();
  list.innerHTML = '';
  updates.forEach(entry => {
    const li = document.createElement('li');
    const sign = entry.delta > 0 ? '+' : '';
    const date = new Date(entry.timestamp);
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const timestamp = date.toLocaleString(undefined, options);
    const teacherStr = entry.teacher ? ` (by ${entry.teacher})` : '';
    li.textContent = `${entry.house}: ${sign}${entry.delta} pts — ${entry.reason}${teacherStr} (${timestamp})`;
    list.appendChild(li);
  });
}

// Expose functions globally for admin page to use
window.housePoints = {
  initData,
  getHouses,
  updateHousePoints,
  undoLastUpdate,
  resetAllPoints,
  renderScoreboard,
  renderUpdates
};

// Automatically initialise data and render scoreboard/updates on pages
document.addEventListener('DOMContentLoaded', () => {
  initData();
  // Render scoreboard if present
  if (document.getElementById('scoreboard')) {
    renderScoreboard();
  }
  // Render updates list if present
  if (document.getElementById('updatesList')) {
    renderUpdates();
  }
});