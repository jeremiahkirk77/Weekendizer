// ==============================
// GLOBAL STATE
// ==============================

let trips = JSON.parse(localStorage.getItem("weekendizerTrips")) || [];
let currentTrip = null;

// ==============================
// DOM ELEMENTS
// ==============================

const tripInput = document.getElementById("tripNameInput");
const tripButton = document.querySelector(".trip-bar button");
const tripSelect = document.getElementById("tripSelect");
const stayInput = document.getElementById("listingUrl");
const stayButton = document.querySelector(".listing-input button");
const stayList = document.getElementById("stayList");
const tripTitle = document.getElementById("currentTripTitle");
const panel = document.querySelector(".trip-panel");

// ==============================
// EVENT LISTENERS
// ==============================

tripButton.addEventListener("click", addTrip);
stayButton.addEventListener("click", addListing);
tripSelect.addEventListener("change", switchTrip);

// ==============================
// TRIP FUNCTIONS
// ==============================

function addTrip() {
  const name = tripInput.value.trim();
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

  tripInput.value = "";
}

function switchTrip() {
  const tripId = Number(tripSelect.value);
  const nextTrip = trips.find(t => t.id === tripId);
  if (!nextTrip) return;

  // Animate out
  panel.classList.add("fade-out");

  setTimeout(() => {
    currentTrip = nextTrip;
    tripTitle.textContent = currentTrip.name;
    renderStays();

    panel.classList.remove("fade-out");
    panel.classList.add("fade-in");

    setTimeout(() => {
      panel.classList.remove("fade-in");
    }, 300);
  }, 250);
}

// ==============================
// STAY FUNCTIONS
// ==============================

function parseListing(url) {
  let platform = "Unknown";
  let name = "Saved Stay";

  if (url.includes("airbnb")) {
    platform = "Airbnb";
    name = "Airbnb Stay";
  } else if (url.includes("booking")) {
    platform = "Booking.com";
    name = "Hotel Booking";
  } else if (url.includes("hotels")) {
    platform = "Hotels.com";
    name = "Hotel Stay";
  }

  return {
    id: Date.now(),
    name,
    platform,
    url
  };
}

function addListing() {
  if (!currentTrip) return;

  const url = stayInput.value.trim();
  if (!url) return;

  currentTrip.stays.push(parseListing(url));

  saveTrips();
  renderStays();
  stayInput.value = "";
}

function removeStay(id) {
  currentTrip.stays = currentTrip.stays.filter(s => s.id !== id);
  saveTrips();
  renderStays();
}

// ==============================
// RENDERING
// ==============================

function renderTrips() {
  tripSelect.innerHTML = "";

  trips.forEach(trip => {
    const option = document.createElement("option");
    option.value = trip.id;
    option.textContent = trip.name;
    if (currentTrip && trip.id === currentTrip.id) {
      option.selected = true;
    }
    tripSelect.appendChild(option);
  });

  tripTitle.textContent = currentTrip ? currentTrip.name : "Your Trip";
}

function renderStays() {
  stayList.innerHTML = "";

  if (!currentTrip) return;

  currentTrip.stays.forEach(stay => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${stay.name}</strong>
        <div class="platform">${stay.platform}</div>
      </div>
      <div>
        <a href="${stay.url}" target="_blank">View</a>
        <button onclick="removeStay(${stay.id})">✕</button>
      </div>
    `;
    stayList.appendChild(li);
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

if (trips.length > 0) {
  currentTrip = trips[0];
  renderTrips();
  renderStays();
}
