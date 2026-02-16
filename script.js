// --- DATA STORAGE ---
let trips = {}; // stores multiple trips
let currentTrip = "default"; // currently selected trip
let listings = []; // current trip's listings

// --- LOAD SAVED DATA ON PAGE LOAD ---
window.onload = function() {
  const savedTrips = localStorage.getItem("weekendizer_trips");
  if (savedTrips) trips = JSON.parse(savedTrips);

  if (!trips[currentTrip]) trips[currentTrip] = [];
  listings = trips[currentTrip];
  renderList();
};

// --- SAVE DATA ---
function saveListings() {
  trips[currentTrip] = listings;
  localStorage.setItem("weekendizer_trips", JSON.stringify(trips));
}

// --- ADD NEW LISTING ---
function addListing() {
  // get input values
  const link = document.getElementById("linkInput").value.trim();
  const price = parseFloat(document.getElementById("priceInput").value);

  if (!link || isNaN(price) || price <= 0) return alert("Enter valid data");

  listings.push({ link, price });
  listings.sort((a, b) => a.price - b.price); // sort by price
  saveListings();
  renderList();
  document.getElementById("linkInput").value = "";
  document.getElementById("priceInput").value = "";
}

// --- DELETE LISTING ---
function deleteListing(index) {
  listings.splice(index, 1); // remove selected
  saveListings();
  renderList();
}

// --- RENDER THE LIST ---
function renderList() {
  const list = document.getElementById("listingList");
  list.innerHTML = ""; // clear
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
  localStorage.setItem("weekendizer_trips", JSON.stringify(trips));

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
