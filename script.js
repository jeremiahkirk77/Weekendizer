let listings = [];

// Load saved listings on page load
window.onload = function () {
  const savedListings = localStorage.getItem("weekendizer_listings");
  if (savedListings) {
    listings = JSON.parse(savedListings);
    renderList();
  }
};

function saveListings() {
  localStorage.setItem(
    "weekendizer_listings",
    JSON.stringify(listings)
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
