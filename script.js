let listings = [];

function addListing() {
  const linkInput = document.getElementById("linkInput");
  const priceInput = document.getElementById("priceInput");

  const link = linkInput.value.trim();
  const price = parseFloat(priceInput.value);

  if (!link || isNaN(price) || price <= 0) {
    alert("Please enter a valid link and a valid nightly price.");
    return;
  }

  listings.push({ link, price });

  // Sort listings from lowest price to highest
  listings.sort((a, b) => a.price - b.price);

  renderList();

  // Clear inputs
  linkInput.value = "";
  priceInput.value = "";
}

function renderList() {
  const list = document.getElementById("listingList");
  list.innerHTML = "";

  listings.forEach((item, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>#${index + 1} — $${item.price}/night</span>
      <div>
        <a href="${item.link}" target="_blank" rel="noopener noreferrer">
          View Listing
        </a>
        <button onclick="deleteListing(${index})">❌</button>
      </div>
    `;

    list.appendChild(li);
  });
}

function deleteListing(index) {
  listings.splice(index, 1);
  renderList();
}
