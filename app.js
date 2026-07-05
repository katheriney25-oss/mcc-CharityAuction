//------------------------------------
// MCC Charity Auction
//------------------------------------

const AUCTION_CONFIG = {
  status: "coming-soon", 
  // options later:
  // coming-soon
  // open
  // closing-soon
  // closed
  // pickup
};

document.addEventListener("DOMContentLoaded", () => {
  updateAuctionStatus();
  wireLandingPageButtons();
  renderAuctionItems(AUCTION_ITEMS);
  wireAuctionFilters();
  wireItemModal();
});

//------------------------------------
// Landing Page Status
//------------------------------------

function updateAuctionStatus() {
  const auctionStatus = document.getElementById("auctionStatus");
  const auctionMessage = document.getElementById("auctionMessage");

  switch (AUCTION_CONFIG.status) {
    case "open":
      auctionStatus.textContent = "Bidding Open";
      auctionMessage.textContent = "Browse auction items and place your bids.";
      break;

    case "closing-soon":
      auctionStatus.textContent = "Closing Soon";
      auctionMessage.textContent = "Get your final bids in before the auction closes.";
      break;

    case "closed":
      auctionStatus.textContent = "Auction Closed";
      auctionMessage.textContent = "Winning bidders will be contacted for payment.";
      break;

    case "pickup":
      auctionStatus.textContent = "Pickup Available";
      auctionMessage.textContent = "Paid items are ready for pickup at the charity auction table.";
      break;

    default:
      auctionStatus.textContent = "Coming Soon";
      auctionMessage.textContent = "Auction items will appear here once bidding opens.";
      break;
  }
}

//------------------------------------
// Buttons
//------------------------------------

function wireLandingPageButtons() {
  document.getElementById("viewAuctionButton").addEventListener("click", () => {
    alert("Auction item list coming next.");
  });

  document.getElementById("donateItemButton").addEventListener("click", () => {
    alert("Item donation form coming next.");
  });

  document.getElementById("myBidsButton").addEventListener("click", () => {
    alert("My Bids page coming next.");
  });

  document.getElementById("rulesButton").addEventListener("click", () => {
    alert("Auction rules modal coming next.");
  });
}

let activeCategory = "All";

function renderAuctionItems(items) {
  const itemsGrid = document.getElementById("itemsGrid");

  itemsGrid.innerHTML = "";

  items.forEach(item => {
    const minimumBid = item.currentBid + 1;

    const card = document.createElement("article");
    card.className = "item-card";

    card.innerHTML = `
      <img src="${item.image}" alt="${item.title}">
      <div class="item-card-content">
        <h3>${item.title}</h3>
        <div class="item-meta">${item.category} · Donated by ${item.donor}</div>
        <div class="current-bid">Current Bid: $${item.currentBid}</div>
        <button class="view-item-button" data-item-id="${item.id}">
          View Item
        </button>
      </div>
    `;

    itemsGrid.appendChild(card);
  });

  document.querySelectorAll(".view-item-button").forEach(button => {
    button.addEventListener("click", () => {
      const itemId = button.dataset.itemId;
      openItemModal(itemId);
    });
  });
}

function wireAuctionFilters() {
  const searchInput = document.getElementById("itemSearch");
  const categoryButtons = document.querySelectorAll(".category-filter");

  searchInput.addEventListener("input", applyAuctionFilters);

  categoryButtons.forEach(button => {
    button.addEventListener("click", () => {
      categoryButtons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      activeCategory = button.dataset.category;
      applyAuctionFilters();
    });
  });
}

function applyAuctionFilters() {
  const searchTerm = document.getElementById("itemSearch").value.toLowerCase();

  const filteredItems = AUCTION_ITEMS.filter(item => {
    const matchesCategory =
      activeCategory === "All" || item.category === activeCategory;

    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm) ||
      item.description.toLowerCase().includes(searchTerm) ||
      item.donor.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  renderAuctionItems(filteredItems);
}

let activeItemId = null;

function openItemModal(itemId) {
  const item = AUCTION_ITEMS.find(item => item.id === itemId);

  if (!item) return;

  activeItemId = item.id;

  document.getElementById("modalItemImage").src = item.image;
  document.getElementById("modalItemImage").alt = item.title;
  document.getElementById("modalItemCategory").textContent = item.category;
  document.getElementById("modalItemTitle").textContent = item.title;
  document.getElementById("modalItemDonor").textContent = `Donated by ${item.donor}`;
  document.getElementById("modalItemDescription").textContent = item.description;
  document.getElementById("modalCurrentBid").textContent = `$${item.currentBid}`;
  document.getElementById("modalMinimumBid").textContent = `$${item.currentBid + 1}`;

  document.getElementById("itemModalBackdrop").classList.remove("hidden");
}

function closeItemModal() {
  document.getElementById("itemModalBackdrop").classList.add("hidden");
  activeItemId = null;
}

function wireItemModal() {
  document.getElementById("closeItemModal").addEventListener("click", closeItemModal);

  document.getElementById("itemModalBackdrop").addEventListener("click", event => {
    if (event.target.id === "itemModalBackdrop") {
      closeItemModal();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeItemModal();
    }
  });

  document.getElementById("openBidButton").addEventListener("click", () => {
    alert("Bid form coming next.");
  });
}