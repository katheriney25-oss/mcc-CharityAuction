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
  initializeAuction();
  wireAuctionFilters();
  wireItemModal();
  wireDonateItemModal();
});

let auctionsItems = [];


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
    openDonateItemModal();
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
    const imageHtml = item.image
        ? `<img src="${item.image}" alt="${item.title}">`
        : `
      <div class="item-image-placeholder">
        <img src="assets/mcc-logo.svg" alt="" class="placeholder-detective">
        <div class="placeholder-text">Pics Unavailable</div>
      </div>            
        `;

    const minimumBid = item.currentBid + 1;
    const card = document.createElement("article");
    card.className = "item-card";

    card.innerHTML = `
      ${imageHtml}
      <div class="item-card-content">
        <h3>${item.title}</h3>
        <div class="item-meta">${item.category} · Donated by ${item.donor}</div>
        <div class="current-bid">Current Bid: $${item.currentBid}</div>
        <button class="view-item-button" data-item-id="${item.itemId}">
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

function wireAuctionFilters(items) {
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

  const filteredItems = items.filter(item => {
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

  async function initializeAuction() {

    auctionItems = await fetchAuctionItems();

    renderAuctionItems(auctionItems);

    wireAuctionFilters(auctionItems);

}

let activeItemId = null;

function openItemModal(itemId) {
  const item = 
  AUCTION_ITEMS.find(item => item.itemId === itemId);

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

//------------------------------------
// Donate Item Modal
//------------------------------------

function openDonateItemModal() {
  document.getElementById("donateModalBackdrop").classList.remove("hidden");
  document.getElementById("donateFormMessage").textContent = "";
  document.getElementById("donateFormMessage").className = "form-message";
}

function closeDonateItemModal() {
  document.getElementById("donateModalBackdrop").classList.add("hidden");
}

function wireDonateItemModal() {
  document.getElementById("closeDonateModal").addEventListener("click", closeDonateItemModal);

  document.getElementById("donateModalBackdrop").addEventListener("click", event => {
    if (event.target.id === "donateModalBackdrop") {
      closeDonateItemModal();
    }
  });

  document.getElementById("donateItemForm").addEventListener("submit", submitDonation);
}

async function submitDonation(event) {
  event.preventDefault();

  const message = document.getElementById("donateFormMessage");
  const submitButton = document.getElementById("submitDonationButton");

  message.textContent = "Submitting item...";
  message.className = "form-message";
  submitButton.disabled = true;

  const donation = {
    donorName: document.getElementById("donorName").value.trim(),
    donorEmail: document.getElementById("donorEmail").value.trim(),
    itemTitle: document.getElementById("itemTitle").value.trim(),
    category: document.getElementById("itemCategory").value,
    description: document.getElementById("itemDescription").value.trim(),
    estimatedValue: document.getElementById("estimatedValue").value,
    suggestedStartingBid: document.getElementById("suggestedStartingBid").value,
    photoUrl: document.getElementById("photoUrl").value.trim()
  };

  const result = await submitItem(donation);

  submitButton.disabled = false;

  if (!result.success) {
    message.textContent = result.message || "Unable to submit item.";
    message.className = "form-message error";
    return;
  }

  message.textContent = "Item submitted for review. Thank you!";
  message.className = "form-message success";

  document.getElementById("donateItemForm").reset();

  setTimeout(() => {
    closeDonateItemModal();
  }, 1400);
}