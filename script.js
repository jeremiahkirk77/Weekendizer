// --- DATA STORAGE ---
let trips = {}; // stores multiple trips and their listings
let currentTrip = "default"; // currently selected trip
let listings = []; // current trip's listings

// --- LOAD DATA ON PAGE LOAD ---
window.onload = function() {
  // load trips from localStorage
  const savedTrips = localStorage.getItem("weekendizer_trips");
  if (savedTrips) trips = JSON.parse(savedTrips);

  // ensure default trip exists
  if (!trips["default"]) trips["default"] = [];

  // set current trip
  currentTrip = "default";
  listings = trips[currentTrip];

  // populate dropdown
  const select = document.getElementById("tripSelect");
  select.innerHTML = ""; // clear existing options
  for (let tripName in trips) {
    const option = document.createElement("option");
    option.value = tripName;
    option.textContent = tripName;
    select.appendChild(option);
  }
  select.value = currentTrip;

  renderList();
};

// --- SAVE DATA ---
function saveTrips() {
  trips[currentTrip] = listings; // update current trip
  localStorage.setItem("weekendizer_trips", JSON.stringify(trips));
}

// --- ADD NEW LISTING ---
function addListing() {
  const link = document.getElementById("linkInput").value.trim();
  const price = parseFloat(document.getElementById("priceInput").value);

  if (!link || isNaN(price) || price <= 0) return alert("Enter valid data");

  listings.push({ link, price });
  listings.sort((a, b) => a.price - b.price);
  saveTrips();
  renderList();

  document.getElementById("linkInput").value = "";
  document.getElementById("priceInput").value = "";
}

// --- DELETE LISTING ---
function deleteListing(index) {
  listings.splice(index, 1);
  saveTrips();
  renderList();
}

// --- RENDER LIST ---
function renderList() {
  const list = document.getElementById("listingList");
  list.innerHTML = "";
  listings.forEach((item, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>#${index + 1} — $${item.price}/night</span>
      <div class="actions">
        <a href="${item.link}" target="_blank">View</a>
        <button class="delete" onclick="deleteListing(${index})">❌</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// --- CREATE NEW TRIP ---
function createNewTrip() {
  let tripName = prompt("Enter a name for your new trip:");
  if (!tripName) return;
  if (trips[tripName]) return alert("Trip already exists!");

  trips[tripName] = [];
  currentTrip = tripName;
  listings = trips[currentTrip];
  saveTrips();

  // update dropdown
  const select = document.getElementById("tripSelect");
  const option = document.createElement("option");
  option.value = tripName;
  option.textContent = tripName;
  select.appendChild(option);
  select.value = tripName;

  renderList();
}

// --- SWITCH TRIPS ---
document.getElementById("tripSelect").addEventListener("change", (e) => {
  currentTrip = e.target.value;
  listings = trips[currentTrip] || [];
  renderList();
});
function deleteCurrentTrip() {
  if (currentTrip === "default") {
    alert("Cannot delete the default trip!");
    return;
  }

  if (!confirm(`Are you sure you want to delete the trip "${currentTrip}"? This will remove all its listings.`)) return;

  // remove from trips object
  delete trips[currentTrip];

  // save updated trips
  localStorage.setItem("weekendizer_trips", JSON.stringify(trips));

  // update dropdown
  const select = document.getElementById("tripSelect");
  select.innerHTML = ""; // clear
  for (let tripName in trips) {
    const option = document.createElement("option");
    option.value = tripName;
    option.textContent = tripName;
    select.appendChild(option);
  }

  // switch to default trip
  currentTrip = "default";
  listings = trips[currentTrip];
  select.value = currentTrip;

  renderList();
}
function parseListing(url) {
  let platform = "Unknown";
  let name = "Saved Stay";

  if (url.includes("airbnb")) {
    platform = "Airbnb";
    name = "Airbnb Stay";
  } else if (url.includes("booking")) {
    platform = "Booking.com";
    name = "Hotel Booking";
  } else if (url.includes("hotels.com")) {
    platform = "Hotels.com";
    name = "Hotel Stay";
  }

  return {
    id: Date.now(),
    platform,
    name,
    url
  };
}

function addListing() {
  const input = document.getElementById("listingUrl");
  const url = input.value.trim();
  if (!url) return;

  const stay = parseListing(url);
  currentTrip.stays.push(stay);

  saveTrips();
  renderStays();

  input.value = "";
}

function renderStays() {
  const list = document.getElementById("stayList");
  list.innerHTML = "";

  currentTrip.stays.forEach(stay => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${stay.name}</strong>
      <span class="platform">${stay.platform}</span>
      <a href="${stay.url}" target="_blank">View</a>
      <button onclick="removeStay(${stay.id})">✕</button>
    `;
    list.appendChild(li);
  });
}

function removeStay(id) {
  currentTrip.stays = currentTrip.stays.filter(stay => stay.id !== id);
  saveTrips();
  renderStays();
}

