let trips = {};
let currentTrip = "default";

let listings = [];

// Load saved listings on page load
window.onload = function () {
  const savedTrips = localStorage.getItem("weekendizer_trips");
  if (savedTrips) {
    trips = JSON.parse(savedTrips);
  }

  if (!trips[currentTrip]) {
    trips[currentTrip] = [];
  }

  listings = trips[currentTrip];
  renderList();
};


function saveListings() {
  trips[currentTrip] = listings;
  localStorage.setItem(
    "weekendizer_trips",
    JSON.stringify(trips)
  );
}


function addListing() {
  const linkInput = document.getElementById("linkInput");
  const priceInput = document.getElementById("priceInput");

  const link = linkInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (!link || isNaN(price) || price <= 0) {
    alert("Please enter a valid link and price.");
    return;
  }

  listings.push({ link, price });

  listings.sort((a, b) => a.price - b.price);

  saveListings();
  renderList();

  linkInput.value = "";
  priceInput.value = "";
}

function deleteListing(index) {
  listings.splice(index, 1);
  saveListings();
  renderList();
}

function renderList() {
  const list = document.getElementById("listingList");
  list.innerHTML = "";

  listings.forEach((item, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>#${index + 1} — $${item.price}/night</span>
      <div>
        <a href="${item.link}" target="_blank">View</a>
        <button onclick="deleteListing(${index})">❌</button>
      </div>
    `;

    list.appendChild(li);
  });
}
// Handle creating a new trip
function createNewTrip() {
  let tripName = prompt("Enter a name for your new trip:");
  if (!tripName) return; // cancel or empty input

  // Avoid duplicate trip names
  if (trips[tripName]) {
    alert("A trip with this name already exists!");
    return;
  }

  // Create new trip
  trips[tripName] = [];
  currentTrip = tripName;
  listings = trips[currentTrip];

  // Save to localStorage
  localStorage.setItem("weekendizer_trips", JSON.stringify(trips));

  // Update dropdown
  const select = document.getElementById("tripSelect");
  const option = document.createElement("option");
  option.value = tripName;
  option.textContent = tripName;
  select.appendChild(option);
  select.value = tripName;

  renderList();
}

// Event listener for dropdown changes
document.getElementById("tripSelect").addEventListener("change", (e) => {
  currentTrip = e.target.value;
  listings = trips[currentTrip] || [];
  renderList();
});

