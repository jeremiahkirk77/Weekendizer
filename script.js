// ==============================
// GLOBAL STATE
// ==============================

let trips = JSON.parse(localStorage.getItem("weekendizerTrips")) || [];
let currentTrip = null;

// Keep last selected trip id so selection persists between reloads
const savedTripId = Number(localStorage.getItem("weekendizerCurrentTripId")) || null;

// ==============================
// DOM ELEMENTS (robust lookups)
// ==============================

// Trip creation
const tripInput = document.getElementById("tripNameInput");
const tripButton = document.getElementById("addTripBtn");

// Trip select
const tripSelect = document.getElementById("tripSelect");

// Listing (stay) input + price + button
const stayInput = document.getElementById("listingUrl");
const stayPriceInput = document.getElementById("listingPrice");
const stayButton = document.getElementById("addListingBtn");

// Stay list UL
const stayList = document.getElementById("stayList");

// Trip title display and panel for animations
const tripTitle = document.getElementById("currentTripTitle");
const panel = document.querySelector(".trip-panel");

// Optional: search controls
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// Defensive checks
if (!tripSelect) console.warn("Missing #tripSelect");
if (!stayList) console.warn("Missing #stayList");
if (!panel) console.warn("Missing .trip-panel");

// ==============================
// EVENT LISTENERS
// ==============================

if (tripButton) tripButton.addEventListener("click", addTrip);
if (tripSelect) tripSelect.addEventListener("change", switchTrip);
if (stayButton) stayButton.addEventListener("click", addListing);

if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    const q = (searchInput && searchInput.value.trim()) || "";
    if (!q) { searchInput && searchInput.focus(); return; }
    console.log("Search:", q);
    // Example visual feedback
    if (panel) {
      panel.style.transition = "box-shadow 300ms ease";
      panel.style.boxShadow = "0 10px 40px rgba(0,0,0,0.6)";
      setTimeout(() => panel.style.boxShadow = "", 600);
    }
  });
}

// Keyboard shortcuts
if (tripInput) tripInput.addEventListener("keydown", (e) => { if (e.key === "Enter") tripButton && tripButton.click(); });
if (stayInput) stayInput.addEventListener("keydown", (e) => { if (e.key === "Enter") stayButton && stayButton.click(); });
if (stayPriceInput) stayPriceInput.addEventListener("keydown", (e) => { if (e.key === "Enter") stayButton && stayButton.click(); });
if (searchInput) searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") searchBtn && searchBtn.click(); });

// Delegated remove handler for stays
if (stayList) {
  stayList.addEventListener("click", (e) => {
    const target = e.target;
    if (!target) return;
    if (target.matches(".remove-stay-btn")) {
      const idStr = target.getAttribute("data-id");
      const id = idStr ? Number(idStr) : NaN;
      if (!Number.isNaN(id)) removeStay(id);
    }
  });
}

// ==============================
// TRIP FUNCTIONS
// ==============================

function addTrip() {
  const name = tripInput ? tripInput.value.trim() : "";
  if (!name) return;

  const newTrip = { id: Date.now(), name, stays: [] };
  trips.push(newTrip);
  currentTrip = newTrip;
  saveTrips();
  // persist selected trip
  localStorage.setItem("weekendizerCurrentTripId", String(currentTrip.id));

  renderTrips();
  renderStays();

  if (tripInput) tripInput.value = "";
}

function switchTrip() {
  if (!tripSelect) return;
  const tripId = Number(tripSelect.value);
  if (Number.isNaN(tripId)) return;

  const nextTrip = trips.find(t => t.id === tripId);
  if (!nextTrip) return;

  // animate panel out
  if (panel) panel.classList.add("fade-out");

  setTimeout(() => {
    currentTrip = nextTrip;
    // persist selected trip
    localStorage.setItem("weekendizerCurrentTripId", String(currentTrip.id));
    if (tripTitle) tripTitle.textContent = currentTrip.name;
    renderStays();

    if (panel) {
      panel.classList.remove("fade-out");
      panel.classList.add("fade-in");
      setTimeout(() => panel.classList.remove("fade-in"), 320);
    }
  }, 220);
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
    // heuristics
    if (text.includes("airbnb")) { platform = "Airbnb"; name = "Airbnb Stay"; }
    else if (text.includes("booking")) { platform = "Booking.com"; name = "Booking Stay"; }
    else if (text.includes("hotels")) { platform = "Hotels.com"; name = "Hotels Stay"; }
    else { name = url.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0]; }
  } else if (text.length > 0) {
    name = text;
  }

  // ensure numeric price
  const nightly = Number(price);
  const nightlyPrice = Number.isFinite(nightly) && nightly > 0 ? nightly : null;

  return {
    id: Date.now(),
    name,
    platform,
    url,
    price: nightlyPrice
  };
}

function addListing() {
  if (!currentTrip) {
    // prompt the user to create a trip
    if (tripInput) { tripInput.focus(); tripInput.classList.add("highlight"); setTimeout(() => tripInput && tripInput.classList.remove("highlight"), 600); }
    return;
  }

  const value = stayInput ? stayInput.value.trim() : "";
  const priceVal = stayPriceInput ? stayPriceInput.value.trim() : "";
  if (!value) { stayInput && stayInput.focus(); return; }

  const item = parseListing(value, priceVal);
  // insert at top
  currentTrip.stays.unshift(item);

  saveTrips();
  renderStays();

  if (stayInput) stayInput.value = "";
  if (stayPriceInput) stayPriceInput.value = "";
  stayInput && stayInput.focus();
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

function renderStays() {
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

    // append with a tiny animation class
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
  localStorage.setItem("weekendizerTrips", JSON.stringify(trips));
  if (currentTrip) {
    localStorage.setItem("weekendizerCurrentTripId", String(currentTrip.id));
  } else {
    localStorage.removeItem("weekendizerCurrentTripId");
  }
}

// ==============================
// INIT
// ==============================

function init() {
  // restore trip selection if present
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
  renderStays();
}

init();
