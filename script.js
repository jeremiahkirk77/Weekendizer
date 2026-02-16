let listings = [];

function addListing() {
  const link = document.getElementById("linkInput").value;
  const price = parseFloat(document.getElementById("priceInput").value);

  if (!link || isNaN(price)) {
    alert("Please enter a valid link and price.");
    return;
  }

  listings.push({ link, price });

  // Sort by lowest price
  listings.sort((a, b) => a.price - b.price);

  renderList();

  document.getElementById("linkInput").value = "";
  document.getElementById("priceInput").value = "";
}

function renderList() {
  const list = document.getElementById("listingList");
  list.innerHTML = "";

  listings.forEach((item, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <span>#${index + 1} — $${item.price}/night</span>
      <a href="${item.link}" target="_blank">View Listing</a>
    `;

    list.appendChild(li);
  });
}
