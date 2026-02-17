// ==============================
// GLOBAL STATE & STORAGE KEYS
// ==============================

const STORAGE_KEY = "weekendizerTrips";
const STORAGE_CURRENT_TRIP_KEY = "weekendizerCurrentTripId";

let trips = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentTrip = null;
let savedTripId = Number(localStorage.getItem(STORAGE_CURRENT_TRIP_KEY)) || null;

// ==============================
// DOM ELEMENTS / VIEWS
// ==============================

const homeView = document.getElementById("home");
const tripsView = document.getElementById("tripsView");
const homeSearchInput = document.getElementById("homeSearchInput");
const homeSearchBtn = document.getElementById("homeSearchBtn");
const searchResultsContainer = document.getElementById("searchResultsContainer");
const backHomeBtn = document.getElementById("backHomeBtn");

// Trip panel elements
const tripInput = document.getElementById("tripNameInput");
const tripButton = document.getElementById("addTripBtn");
const tripSelect = document.getElementById("tripSelect");
const stayInput = document.getElementById("listingUrl");
const stayPriceInput = document.getElementById("listingPrice");
const stayButton = document.getElementById("addListingBtn");
const stayList = document.getElementById("stayList");
const tripTitle = document.getElementById("currentTripTitle");
const panel = document.querySelector(".trip-panel");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// ==============================
// VIEW HELPERS
// ==============================

function showHome() {
  homeView.classList.add("active"); 
  homeView.classList.remove("hidden");
  tripsView.classList.remove("active"); 
  tripsView.classList.add("hidden");
  if (homeSearchInput) homeSearchInput.focus();
}

function showTrips() {
  tripsView.classList.add("active"); 
  tripsView.classList.remove("hidden");
  homeView.classList.remove("active"); 
  homeView.classList.add("hidden");
}

// ==============================
// SEARCH LOGIC
// ==============================

function performSearch(q) {
  const term = (q || "").trim().toLowerCase();
  const results = term.length === 0 ? [] : trips.filter(t => t.name.toLowerCase().includes(term));
  renderSearchResults(results, term);
  showTrips();
}

function renderSearchResults(results, term) {
  if (!searchResultsContainer) return;
  searchResultsContainer.innerHTML = "";

  const heading = document.createElement("div");
  heading.style.margin = "0 0 12px 0";
  heading.style.fontWeight = "600";
  heading.textContent = term ? `Results for “${term}”` : "All Trips";
  searchResultsContainer.appendChild(heading);

  const ul = document.createElement("ul");
  ul.style.listStyle = "none";

  if (results.length === 0) {
    const li = document.createElement("li");
    li.innerHTML = `<div style="padding:16px; background:rgba(0,0,0,0.03); border-radius:12px;">No trips found.</div>`;
    ul.appendChild(li);
  } else {
    results.forEach(trip => {
      const li = document.createElement("li");
      li.className = "search-result"; // Matches your result styles
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      li.style.padding = "10px 0";

      li.innerHTML = `
        <span>${trip.name}</span>
        <button class="btn-small" onclick="selectTripById(${trip.id})">Open</button>
      `;
      ul.appendChild(li);
    });
  }
  searchResultsContainer.appendChild(ul);
}

// ==============================
// TRIP CRUD
// ==============================

function createTripAndOpen(name) {
  const newTrip = { id: Date.now(), name, stays: [] };
  trips.unshift(newTrip);
  currentTrip = newTrip;
  saveTrips();
  renderTrips();
  renderStaysWithTransition();
  localStorage.setItem(STORAGE_CURRENT_TRIP_KEY, String(currentTrip.id));
}

function addTrip() {
  const name = (tripInput && tripInput.value.trim()) || "";
  if (!name) return;
  createTripAndOpen(name);
  if (tripInput) tripInput.value = "";
}

function selectTripById(id) {
  const t = trips.find(tr => tr.id === id);
  if (!t) return;
  
  if (panel) panel.style.opacity = "0";
  
  setTimeout(() => {
    currentTrip = t;
    localStorage.setItem(STORAGE_CURRENT_TRIP_KEY, String(currentTrip.id));
    renderTrips();
    renderStaysWithTransition();
    if (panel) panel.style.opacity = "1";
  }, 200);
}

// ==============================
// STAY FUNCTIONS
// ==============================

function parseListing(inputText, price) {
  const text = (inputText || "").trim();
  let platform = "Other";
  let name = text;
  let url = "";

  if (text.startsWith("http")) {
    url = text;
    if (text.includes("airbnb")) platform = "Airbnb";
    else if (text.includes("booking")) platform = "Booking.com";
    else if (text.includes("hotels")) platform = "Hotels.com";
    name = platform + " Stay";
  }

  const nightly = Number(price);
  return { 
    id: Date.now(), 
    name: name || "New Stay", 
    platform, 
    url, 
    price: nightly > 0 ? nightly : null 
  };
}

function addListing() {
  if (!currentTrip) return;
  const value = (stayInput && stayInput.value.trim()) || "";
  const priceVal = (stayPriceInput && stayPriceInput.value.trim()) || "";
  if (!value) return;

  const item = parseListing(value, priceVal);
  currentTrip.stays.push(item);
  saveTrips();
  renderStaysWithTransition();

  if (stayInput) stayInput.value = "";
  if (stayPriceInput) stayPriceInput.value = "";
}

function removeStay(id) {
  if (!currentTrip) return;
  currentTrip.stays = currentTrip.stays.filter(s => s.id !== id);
  saveTrips();
  renderStaysWithTransition();
}

// ==============================
// THE UPDATED RENDERER
// ==============================

function renderTrips() {
  if (!tripSelect) return;
  tripSelect.innerHTML = "";
  trips.forEach(trip => {
    const opt = document.createElement("option");
    opt.value = trip.id;
    opt.textContent = trip.name;
    if (currentTrip && trip.id === currentTrip.id) opt.selected = true;
    tripSelect.appendChild(opt);
  });
  if (tripTitle) tripTitle.textContent = currentTrip ? currentTrip.name : "Your Trip";
}

function renderStaysWithTransition() {
  if (!stayList) return;
  stayList.innerHTML = "";

  if (!currentTrip || !currentTrip.stays || currentTrip.stays.length === 0) {
    stayList.innerHTML = `<li class="empty-note" style="text-align:center; padding:2rem; opacity:0.6;">No stays added yet.</li>`;
    return;
  }

  // SORTING: Rank by price (Cheapest first)
  const sortedStays = [...currentTrip.stays].sort((a, b) => {
    return (a.price || Infinity) - (b.price || Infinity);
  });

  sortedStays.forEach((stay, index) => {
    const li = document.createElement("li");
    
    // NEW: Add top-ranked class for the first (cheapest) item
    if (index === 0) li.classList.add("top-ranked");

    li.innerHTML = `
      <div class="left">
        <strong>${stay.name}</strong>
        <div class="platform">${stay.platform}</div>
      </div>
      <div class="right">
        <div class="price">${stay.price ? `$${stay.price}<span>/night</span>` : "—"}</div>
        ${stay.url ? `<a href="${stay.url}" target="_blank" class="btn-view" style="margin-right:10px; font-size:12px; text-decoration:none; color:var(--brand-orange);">View</a>` : ''}
        <button class="remove-stay-btn" data-id="${stay.id}">✕</button>
      </div>
    `;

    stayList.appendChild(li);
  });
}

// ==============================
// STORAGE & EVENTS
// ==============================

function saveTrips() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  if (currentTrip) localStorage.setItem(STORAGE_CURRENT_TRIP_KEY, String(currentTrip.id));
}

if (homeSearchBtn) homeSearchBtn.addEventListener("click", () => performSearch(homeSearchInput.value));
if (backHomeBtn) backHomeBtn.addEventListener("click", showHome);
if (tripButton) tripButton.addEventListener("click", addTrip);
if (stayButton) stayButton.addEventListener("click", addListing);

if (tripSelect) {
  tripSelect.addEventListener("change", () => selectTripById(Number(tripSelect.value)));
}

if (stayList) {
  stayList.addEventListener("click", e => {
    if (e.target.classList.contains("remove-stay-btn")) {
      removeStay(Number(e.target.dataset.id));
    }
  });
}

// ==============================
// INIT
// ==============================

function init() {
  if (trips.length > 0) {
    currentTrip = trips.find(t => t.id === savedTripId) || trips[0];
  }
  renderTrips();
  renderStaysWithTransition();
  showHome();
}

init();
