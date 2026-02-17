// ==============================
// GLOBAL STATE
// ==============================

let trips = JSON.parse(localStorage.getItem("weekendizerTrips")) || [];
let currentTrip = null;

// ==============================
// DOM ELEMENTS (robust lookups)
// ==============================

// Trip creation
const tripInput = document.getElementById("tripNameInput");
const tripButton = document.getElementById("addTripBtn");

// Trip select
const tripSelect = document.getElementById("tripSelect");

// Listing (stay) input + button
// note: your original code used "listingUrl" as an id — we use that here
const stayInput = document.getElementById("listingUrl");
const stayButton = document.getElementById("addListingBtn");

// Stay list UL
const stayList = document.getElementById("stayList");

// Trip title display and panel for animations
const tripTitle = document.getElementById("currentTripTitle");
const panel = document.querySelector(".trip-panel");

// Optional: search controls (not part of original trips logic but present in UI)
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// If any critical DOM nodes are missing, warn in console but continue gracefully
if (!tripSelect) console.warn("No #tripSelect element found.");
if (!stayList) console.warn("No #stayList element found.");
if (!panel) console.warn("No .trip-panel element found.");

// ==============================
// EVENT LISTENERS
// ==============================

if (tripButton) tripButton.addEventListener("click", addTrip);
if (tripSelect) tripSelect.addEventListener("change", switchTrip);
if (stayButton) stayButton.addEventListener("click", addListing);

// search (demo: logs search term)
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    const q = (searchInput && searchInput.value.trim()) || "";
    if (!q) {
      if (searchInput) searchInput.focus();
      return;
    }
    console.log("Search:", q);
    // placeholder: add real search integration here if desired
    const panelEl = document.querySelector(".trip-panel");
    if (panelEl) {
      panelEl.style.transition = "box-shadow 300ms ease";
      panelEl.style.boxShadow = "0 10px 40px rgba(0,0,0,0.6)";
      setTimeout(() => (panelEl.style.boxShadow = ""), 600);
    }
  });
}

// keyboard helpers: Enter on inputs
if (tripInput) tripInput.addEventListener("keydown", (e) => { if (e.key === "Enter") tripButton && tripButton.click(); });
if (stayInput) stayInput.addEventListener("keydown", (e) => { if (e.key === "Enter") stayButton && stayButton.click(); });
if (searchInput) searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") searchBtn && searchBtn.click(); });

// event delegation for remove buttons inside stayList
if (stayList) {
  stayList.addEventListener("click", (e) => {
    const target = /** @type {HTMLElement} */ (e.target);
    // look for a remove button with data-id
    if (target && target.matches && target.matches(".remove-stay-btn")) {
      const idStr = target.getAttribute("data-id");
      const id = idStr ? Number(idStr) : NaN;
      if (!Number.isNaN(id)) {
        removeStay(id);
      }
    }
  });
}

// ==============================
// TRIP FUNCTIONS
// ==============================

function addTrip() {
  const name = tripInput ? tripInput.value.trim() : "";
  if (!name) return;

  const newTrip = {
    id: Date.now(),
    name,
    stays: []
  };

  trips.push(newTrip);
  currentTrip = newTrip;

  saveTrips();
  renderTrips();
  renderStays();

  if (tripInput) tripInput.value = "";
}

function switchTrip() {
  const tripId = tripSelect ? Number(tripSelect.value) : NaN;
  if (!tripSelect || Number.isNaN(tripId)) return;

  const nextTrip = trips.find(t => t.id === tripId);
  if (!nextTrip) return;

  // Animate out
  if (panel) panel.classList.add("fade-out");

  setTimeout(() => {
    currentTrip = nextTrip;
    if (tripTitle) tripTitle.textContent = currentTrip.name;
    renderStays();

    if (panel) {
      panel.classList.remove("fade-out");
      panel.classList.add("fade-in");

      setTimeout(() => {
        panel.classList.remove("fade-in");
      }, 300);
    }
  }, 200);
}

// ==============================
// STAY FUNCTIONS
// ==============================

function parseListing(urlOrName) {
  let platform = "Unknown";
  let name = "Saved Stay";
  const url = urlOrName || "";

  // Basic heuristics for platform if url is used
  if (url.includes("airbnb")) {
    platform = "Airbnb";
    name = "Airbnb Stay";
  } else if (url.includes("booking")) {
    platform = "Booking.com";
    name = "Hotel Booking";
  } else if (url.includes("hotels")) {
    platform = "Hotels.com";
    name = "Hotel Stay";
  } else {
    // If not a URL, use the raw string as the name
    if (!url.startsWith("http") && url.trim().length > 0) {
      name = url.trim();
    }
  }

  return {
    id: Date.now(),
    name,
    platform,
    url
  };
}

function addListing() {
  if (!currentTrip) {
    // If no trip yet, focus trip input to encourage making one
    if (tripInput) {
      tripInput.focus();
      tripInput.classList.add("highlight");
      setTimeout(() => tripInput && tripInput.classList.remove("highlight"), 600);
    }
    return;
  }

  const value = stayInput ? stayInput.value.trim() : "";
  if (!value) {
    if (stayInput) stayInput.focus();
    return;
  }

  const item = parseListing(value);
  currentTrip.stays.unshift(item); // insert at top

  saveTrips();
  renderStays();

  if (stayInput) {
    stayInput.value = "";
    stayInput.focus();
  }
}

function removeStay(id) {
  if (!currentTrip) return;
  currentTrip.stays = currentTrip.stays.filter(s => s.id !== id);
  saveTrips();
  renderStays();
}

// ==============================
// RENDERING
// ==============================

function renderTrips() {
  if (!tripSelect) return;
  tripSelect.innerHTML = "";

  // if no trips exist, show placeholder option
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
    if (currentTrip && trip.id === currentTrip.id) {
      option.selected = true;
    }
    tripSelect.appendChild(option);
  });

  if (tripTitle) tripTitle.textContent = currentTrip ? currentTrip.name : "Your Trip";
}

function renderStays() {
  if (!stayList) return;

  stayList.innerHTML = "";

  if (!currentTrip) {
    // show empty state
    const li = document.createElement("li");
    li.style.opacity = "0.6";
    li.style.padding = "18px";
    li.textContent = "No trip selected. Create one above to add stays.";
    stayList.appendChild(li);
    return;
  }

  if (!currentTrip.stays || currentTrip.stays.length === 0) {
    const li = document.createElement("li");
    li.style.opacity = "0.8";
    li.style.padding = "18px";
    li.textContent = "No stays added yet — add one above.";
    stayList.appendChild(li);
    return;
  }

  currentTrip.stays.forEach(stay => {
    const li = document.createElement("li");
    li.classList.add("fade-in");
    li.setAttribute("data-id", String(stay.id));

    const left = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = stay.name || "Stay";
    left.appendChild(strong);

    const platform = document.createElement("div");
    platform.className = "platform";
    platform.textContent = stay.platform || "Unknown";
    left.appendChild(platform);

    const right = document.createElement("div");

    const view = document.createElement("a");
    view.href = stay.url || "#";
    view.target = "_blank";
    view.rel = "noopener";
    view.textContent = "View";
    right.appendChild(view);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-stay-btn";
    removeBtn.setAttribute("data-id", String(stay.id));
    removeBtn.style.marginLeft = "10px";
    removeBtn.textContent = "✕";
    // Using event delegation on the UL, so no click handler here.
    right.appendChild(removeBtn);

    li.appendChild(left);
    li.appendChild(right);

    stayList.appendChild(li);

    // small entry animation
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
  localStorage.setItem("weekendizerTrips", JSON.stringify(trips));
}

// ==============================
// INIT
// ==============================

function init() {
  if (trips.length > 0) {
    currentTrip = trips[0];
  } else {
    currentTrip = null;
  }

  renderTrips();
  renderStays();
}

init();
