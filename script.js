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

// Defensive checks
if (!homeView || !tripsView) console.warn("Views missing");
if (!stayList) console.warn("stayList missing");

// ==============================
// VIEW HELPERS
// ==============================

function showHome() {
  homeView.classList.add("active"); homeView.classList.remove("hidden");
  tripsView.classList.remove("active"); tripsView.classList.add("hidden");
  homeSearchInput && homeSearchInput.focus();
}

function showTrips() {
  tripsView.classList.add("active"); tripsView.classList.remove("hidden");
  homeView.classList.remove("active"); homeView.classList.add("hidden");
  tripSelect && tripSelect.focus();
}

// ==============================
// SEARCH: from home -> trips view
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
  heading.style.marginBottom = "8px";
  heading.textContent = term ? `Search results for “${term}”` : "Search";
  searchResultsContainer.appendChild(heading);

  const ul = document.createElement("ul");
  ul.className = "search-results-list";

  if (results.length === 0) {
    const li = document.createElement("li");
    li.className = "search-result";
    li.textContent = "No trips found.";
    const addBtn = document.createElement("button");
    addBtn.className = "btn-small";
    addBtn.textContent = term ? `Add trip "${term}"` : "Create a new trip";
    addBtn.addEventListener("click", () => {
      const name = term || (tripInput && tripInput.value.trim()) || `Trip ${Date.now()}`;
      createTripAndOpen(name);
    });
    const right = document.createElement("div");
    right.className = "actions";
    right.appendChild(addBtn);

    li.appendChild(right);
    ul.appendChild(li);
  } else {
    results.forEach(trip => {
      const li = document.createElement("li");
      li.className = "search-result";

      const label = document.createElement("div");
      label.textContent = trip.name;

      const actions = document.createElement("div");
      actions.className = "actions";

      const openBtn = document.createElement("button");
      openBtn.className = "btn-small";
      openBtn.textContent = "Open";
      openBtn.addEventListener("click", () => {
        selectTripById(trip.id);
      });

      const addBtn = document.createElement("button");
      addBtn.className = "btn-small";
      addBtn.textContent = "Copy & New";
      addBtn.title = "Create a new trip with this name";
      addBtn.addEventListener("click", () => {
        createTripAndOpen(`${trip.name} (copy)`);
      });

      actions.appendChild(openBtn);
      actions.appendChild(addBtn);

      li.appendChild(label);
      li.appendChild(actions);
      ul.appendChild(li);
    });
  }

  searchResultsContainer.appendChild(ul);
}

// ==============================
// TRIP CRUD & SWITCHING
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
  if (panel) panel.classList.add("fade-out");
  setTimeout(() => {
    currentTrip = t;
    localStorage.setItem(STORAGE_CURRENT_TRIP_KEY, String(currentTrip.id));
    renderTrips();
    renderStaysWithTransition();
    if (panel) {
      panel.classList.remove("fade-out");
      panel.classList.add("fade-in");
      setTimeout(() => panel.classList.remove("fade-in"), 320);
    }
  }, 200);
}

// ==============================
// STAY FUNCTIONS
// ==============================

function parseListing(inputText, price) {
  const text = (inputText || "").trim();
  let platform = "Unknown";
  let name = "Saved Stay";
  let url = "";

  if (text.startsWith("http")) {
    url = text;
    if (text.includes("airbnb")) { platform = "Airbnb"; name = "Airbnb Stay"; }
    else if (text.includes("booking")) { platform = "Booking.com"; name = "Booking Stay"; }
    else if (text.includes("hotels")) { platform = "Hotels.com"; name = "Hotels Stay"; }
    else { name = url.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0]; }
  } else if (text.length > 0) {
    name = text;
  }

  const nightly = Number(price);
  const nightlyPrice = Number.isFinite(nightly) && nightly > 0 ? nightly : null;

  return { id: Date.now(), name, platform, url, price: nightlyPrice };
}

function addListing() {
  if (!currentTrip) {
    tripInput && tripInput.focus();
    return;
  }
  const value = (stayInput && stayInput.value.trim()) || "";
  const priceVal = (stayPriceInput && stayPriceInput.value.trim()) || "";
  if (!value) { stayInput && stayInput.focus(); return; }

  const item = parseListing(value, priceVal);
  currentTrip.stays.unshift(item);
  saveTrips();
  renderStaysWithTransition();

  if (stayInput) stayInput.value = "";
  if (stayPriceInput) stayPriceInput.value = "";
  stayInput && stayInput.focus();
}

function removeStay(id) {
  if (!currentTrip) return;
  currentTrip.stays = currentTrip.stays.filter(s => s.id !== id);
  saveTrips();
  renderStaysWithTransition();
}

// ==============================
// RENDERING (trips, stays)
// ==============================

function renderTrips() {
  if (!tripSelect) return;
  tripSelect.innerHTML = "";

  if (trips.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "No trips yet — create one";
    tripSelect.appendChild(opt);
    if (tripTitle) tripTitle.textContent = "Your Trip";
    return;
  }

  trips.forEach(trip => {
    const option = document.createElement("option");
    option.value = trip.id;
    option.textContent = trip.name;
    if (currentTrip && trip.id === currentTrip.id) option.selected = true;
    tripSelect.appendChild(option);
  });

  if (tripTitle) tripTitle.textContent = currentTrip ? currentTrip.name : "Your Trip";
}

function renderStaysWithTransition() {
  if (!stayList) return;
  stayList.innerHTML = "";

  if (!currentTrip) {
    const li = document.createElement("li");
    li.className = "empty-note";
    li.textContent = "No trip selected. Create one above to add stays.";
    stayList.appendChild(li);
    return;
  }

  if (!currentTrip.stays || currentTrip.stays.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-note";
    li.textContent = "No stays added yet — add one above.";
    stayList.appendChild(li);
    return;
  }

  currentTrip.stays.forEach(stay => {
    const li = document.createElement("li");
    li.setAttribute("data-id", String(stay.id));

    const left = document.createElement("div");
    left.className = "left";
    const strong = document.createElement("strong");
    strong.textContent = stay.name || "Stay";
    left.appendChild(strong);

    const platform = document.createElement("div");
    platform.className = "platform";
    platform.textContent = stay.platform || "Unknown";
    left.appendChild(platform);

    const right = document.createElement("div");
    right.className = "right";

    const price = document.createElement("div");
    price.className = "price";
    price.textContent = stay.price != null ? `$${stay.price}/night` : "—";
    right.appendChild(price);

    const view = document.createElement("a");
    view.href = stay.url || "#";
    view.target = "_blank";
    view.rel = "noopener";
    view.textContent = "View";
    right.appendChild(view);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-stay-btn";
    removeBtn.setAttribute("data-id", String(stay.id));
    removeBtn.textContent = "✕";
    right.appendChild(removeBtn);

    li.appendChild(left);
    li.appendChild(right);

    li.classList.add("fade-in");
    stayList.appendChild(li);
    requestAnimationFrame(() => {
      li.classList.remove("fade-in");
      li.style.opacity = "1";
      li.style.transform = "translateY(0)";
    });
  });
}

// ==============================
// STORAGE
// ==============================

function saveTrips() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
  if (currentTrip) localStorage.setItem(STORAGE_CURRENT_TRIP_KEY, String(currentTrip.id));
  else localStorage.removeItem(STORAGE_CURRENT_TRIP_KEY);
}

// ==============================
// EVENTS / BINDINGS
// ==============================

if (homeSearchBtn) homeSearchBtn.addEventListener("click", () => performSearch(homeSearchInput.value));
if (homeSearchInput) homeSearchInput.addEventListener("keydown", e => { if (e.key === "Enter") performSearch(homeSearchInput.value); });

if (backHomeBtn) backHomeBtn.addEventListener("click", () => showHome());

if (tripButton) tripButton.addEventListener("click", addTrip);
if (tripSelect) tripSelect.addEventListener("change", () => {
  const id = Number(tripSelect.value);
  if (!Number.isNaN(id)) selectTripById(id);
});

if (stayButton) stayButton.addEventListener("click", addListing);
if (stayList) {
  stayList.addEventListener("click", e => {
    const target = e.target;
    if (!target) return;
    if (target.matches(".remove-stay-btn")) {
      const idStr = target.getAttribute("data-id");
      const id = idStr ? Number(idStr) : NaN;
      if (!Number.isNaN(id)) removeStay(id);
    }
  });
}

if (searchBtn) searchBtn.addEventListener("click", () => {
  const q = (searchInput && searchInput.value.trim()) || "";
  performSearch(q);
});
if (searchInput) searchInput.addEventListener("keydown", e => { if (e.key === "Enter") performSearch(searchInput.value); });

// ==============================
// INIT
// ==============================

function init() {
  if (trips.length > 0) {
    if (savedTripId) {
      const found = trips.find(t => t.id === savedTripId);
      currentTrip = found || trips[0];
    } else {
      currentTrip = trips[0];
    }
  } else {
    currentTrip = null;
  }

  renderTrips();
  renderStaysWithTransition();

  // Start on home view
  showHome();
}

init();
