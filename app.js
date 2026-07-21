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
const BIDDER_EMAIL_KEY = "mccAuctionBidderEmail";

document.addEventListener("DOMContentLoaded", () => {
  updateAuctionStatus();
  wireLandingPageButtons();
  initializeAuction();
  wireAuctionFilters();
  wireItemModal();
  wireDonateItemModal();
  wireBidModal()
  wireRulesModal();
  wireMyBidsModal();
});

let auctionItems = [];


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
      auctionMessage.textContent = "Feel free to submit donations as well as browse available items to plan your bids! Bidding will open soon!";
      break;
  }
}
function biddingIsOpen() {
  return (
    AUCTION_CONFIG.status === "open" ||
    AUCTION_CONFIG.status === "closing-soon"
  );
}
//------------------------------------
// Buttons
//------------------------------------

function wireLandingPageButtons() {

  document.getElementById("donateItemButton").addEventListener("click", () => {
    openDonateItemModal();
  });

  document.getElementById("myBidsButton").addEventListener("click", () => {
    openMyBidsModal();
  });

  document.getElementById("rulesButton").addEventListener("click", () => {
    openRulesModal();
  });
}

let activeCategory = "All";

function renderAuctionItems(items) {
  const itemsGrid = document.getElementById("itemsGrid");

  if (!itemsGrid) return;

  itemsGrid.innerHTML = "";

  if (!items.length) {
    itemsGrid.innerHTML = `
      <div class="empty-auction-message">
        No auction items are currently available.
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const imageHtml = getImageHtml(item);

    const card = document.createElement("article");
    const hasBid = Number(item.bidCount) > 0;
    const bidLabel = hasBid
      ? "Current High Bid"
      : "Recommended Starting Bid";
    
    const displayBid = hasBid
      ? Number(item.currentBid)
      : Number(item.startingBid);

    const minimumBid = hasBid
      ? Number(item.currentBid) + 1
      : 1;

    card.className = "item-card";

    card.innerHTML = `
      <div class="item-image-wrap">
        ${imageHtml}
      </div>

      <div class="item-card-content">
        <div class="item-category">${item.category}</div>

        <h3>${item.title}</h3>

        <p class="item-description">
          ${item.description}
        </p>

        <div class="item-bid-summary">
          <div>
            <span class="item-label">${bidLabel}</span>
            <strong>$${displayBid}</strong>
          </div>

          <div>
            <span class="item-label">Minimum Next Bid</span>
            <strong>$${minimumBid}</strong>
          </div>
        </div>

        <div class="item-footer">
          <span>${item.bidCount || 0} bid${Number(item.bidCount) === 1 ? "" : "s"}</span>

          <button class="view-item-button" data-item-id="${item.itemId}">
            View Item
          </button>
        </div>
      </div>
    `;

    itemsGrid.appendChild(card);
  });

  document.querySelectorAll(".view-item-button").forEach(button => {
    button.addEventListener("click", () => {
      openItemModal(button.dataset.itemId);
    });
  });
}

function getImagePlaceholderHtml(text = "Image Unavailable") {
  return `
    <div class="item-image-placeholder">
      <img src="assets/mcc-logo.svg" alt="" class="placeholder-detective">
      <div class="placeholder-text">${text}</div>
    </div>
  `;
}

function getDisplayImageUrl(url) {
  if (!url) return "";

  const trimmedUrl = String(url).trim();

  // Standard Google Drive sharing URL:
  // https://drive.google.com/file/d/FILE_ID/view
  const filePathMatch = trimmedUrl.match(
    /drive\.google\.com\/file\/d\/([^/?#]+)/
  );

  if (filePathMatch) {
    const fileId = filePathMatch[1];

    return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1200`;
  }

  // Alternate Google Drive links:
  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/uc?id=FILE_ID
  try {
    const parsedUrl = new URL(trimmedUrl);

    if (parsedUrl.hostname.includes("drive.google.com")) {
      const fileId = parsedUrl.searchParams.get("id");

      if (fileId) {
        return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1200`;
      }
    }
  } catch (error) {
    console.warn("Invalid image URL:", trimmedUrl);
    return "";
  }

  // A normal non-Drive image URL does not need conversion.
  return trimmedUrl;
}

/*
  Finds the image URL on an auction item and returns
  the final display-ready version.

  Any card, modal, or future image display should call
  this function rather than reading item.image directly.
*/
function getItemImageUrl(item) {
  if (!item) return "";

  const originalUrl =
    item.image ||
    item.photoUrl ||
    item.imageUrl ||
    item.PhotoUrl ||
    item.ImageUrl ||
    "";

  return getDisplayImageUrl(originalUrl);
}



function getImageHtml(item) {
  const imageUrl = getItemImageUrl(item);
  
  if (!imageUrl) {
    return getImagePlaceholderHtml();
  }

  return `
    <img
      src="${escapeHtmlAttribute(imageUrl)}"
      alt="${escapeHtmlAttribute(item.title || "Auction item")}"
      class="item-image"
      loading="lazy"
      onerror="
        this.onerror = null;
        this.parentElement.innerHTML = getImagePlaceholderHtml();
      "
    >
  `;
}

function escapeHtmlAttribute(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}


function setModalImage(item) {
  const modalImage = document.getElementById("modalItemImage");
  const imageUrl = getItemImageUrl(item);

  // Clear any previous item's error handler.
  modalImage.onerror = null;

if (!imageUrl) {
    modalImage.src = "assets/mcc-logo.svg";
    modalImage.alt = "Image unavailable";
    return;
  }

  modalImage.src = imageUrl;
  modalImage.alt = item.title || "Auction item";

  modalImage.onerror = () => {
    modalImage.onerror = null;
    modalImage.src = "assets/mcc-logo.svg";
    modalImage.alt = "Image unavailable";
  };
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

  const filteredItems = auctionItems.filter(item => {
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

function openRulesModal() {
  document.getElementById("rulesModalBackdrop").classList.remove("hidden");
}

function closeRulesModal() {
  document.getElementById("rulesModalBackdrop").classList.add("hidden");
}

function wireRulesModal() {
  document.getElementById("closeRulesModal").addEventListener("click", closeRulesModal);

  document.getElementById("rulesModalBackdrop").addEventListener("click", event => {
    if (event.target.id === "rulesModalBackdrop") {
      closeRulesModal();
    }
  });

  document.addEventListener("keydown", event => {
     if (event.key === "Escape") {
      closeRulesModal();
    }
  });
}


let activeItemId = null;

function openItemModal(itemId) {
  const item = 
  auctionItems.find(item => item.itemId === itemId);

  if (!item) return;

  activeItemId = item.itemId;

  setModalImage(item);
  document.getElementById("modalItemCategory").textContent = item.category;
  document.getElementById("modalItemTitle").textContent = item.title;
  document.getElementById("modalItemDonor").textContent = `Donated by ${item.donor}`;
  document.getElementById("modalItemDescription").textContent = item.description;
  document.getElementById("modalCurrentBid").textContent = `$${item.currentBid}`;
  document.getElementById("modalMinimumBid").textContent = `$${item.minimumBid}`;

  const bidButton = document.getElementById("openBidButton");
  if (biddingIsOpen()) {
    bidButton.disabled = false;
    bidButton.textContent = "Place a Bid";
  } else {
    bidButton.disabled = true;
    bidButton.textContent = 
      AUCTION_CONFIG.status === "closed"
      ? "Auction Closed"
      : "Bidding Closed";
  }

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
    const itemId = activeItemId;
    closeItemModal();
    openBidModal(itemId);
  });
}

function wireBidModal() {

    document.getElementById("bidModal").addEventListener("click", event => {
        if (event.target.id === "bidModal") {
            closeBidModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeBidModal();
        }
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

let activeBidItem = null;

function openBidModal(itemId) {
  const item = auctionItems.find(item => item.itemId === itemId);

  if (!item) return;

  activeBidItem = item;

  document.getElementById("bidItemId").value = item.itemId;
  document.getElementById("bidItemTitle").textContent = item.title;

  document.getElementById("bidItemCurrentBid").textContent =
    `Current high bid: $${item.currentBid}`;

  document.getElementById("bidItemMinimumBid").textContent =
    `Minimum next bid: $${item.minimumBid}`;

  document.getElementById("bidAmount").value = item.minimumBid;
  document.getElementById("bidAmount").min = item.minimumBid;

  document.getElementById("bidSubmissionMessage").textContent = "";
  document.getElementById("bidSubmissionMessage").className = "form-message";

  document.getElementById("bidModal").classList.remove("hidden");
}

function closeBidModal() {
  document.getElementById("bidModal").classList.add("hidden");
  document.getElementById("bidForm").reset();
  activeBidItem = null;
}

async function submitBidForm(event) {
  event.preventDefault();

  const message = document.getElementById("bidSubmissionMessage");
  const submitButton = document.getElementById("submitBidButton");
  message.textContent = "";
  message.className = "form-message";
  
 

  const bidData = {
    itemId: document.getElementById("bidItemId").value,
    bidderName: document.getElementById("bidderName").value.trim(),
    bidderEmail: document.getElementById("bidderEmail").value.trim(),
    bidAmount: Number(document.getElementById("bidAmount").value),
    notifyIfOutbid: document.getElementById("notifyIfOutbid").checked
  };
    localStorage.setItem(BIDDER_EMAIL_KEY, bidData.bidderEmail);

  if (!bidData.itemId || !bidData.bidderName || !bidData.bidderEmail || !bidData.bidAmount) {
    message.textContent = "Please complete all required fields.";
    message.classList.add("error");
    return;
  }

  if (!Number.isInteger(bidData.bidAmount)) {
    message.textContent = "Bids must be whole dollars.";
    message.classList.add("error");
    return;
  }

  if (activeBidItem && bidData.bidAmount < activeBidItem.minimumBid) {
    message.textContent = `Bid must be at least $${activeBidItem.minimumBid}.`;
    message.classList.add("error");
    return;
  }

  try {
    message.textContent = "Submitting bid...";

    const result = await submitBid(bidData);

    

    if (!result.success) {
      message.textContent = result.message || "Bid could not be submitted.";
      message.classList.add("error");
      return;
    }


    message.textContent = "Bid accepted - Good Luck!";
    message.classList.add("success");

    await initializeAuction();

    setTimeout(() => {
      closeBidModal();
    }, 900);

  } catch (error) {
    console.error(error);
    message.textContent = "Something went wrong submitting your bid.";
    message.classList.add("error");
  }
}

//------------------------------------
// My Bids Modal
//------------------------------------

function openMyBidsModal() {
  const savedEmail = localStorage.getItem(BIDDER_EMAIL_KEY) || "";

  document.getElementById("myBidsEmail").value = savedEmail;
  document.getElementById("myBidsMessage").textContent = "";
  document.getElementById("myBidsMessage").className = "form-message";
  document.getElementById("myBidsResults").innerHTML = "";

  document.getElementById("myBidsModalBackdrop").classList.remove("hidden");
}

function closeMyBidsModal() {
  document.getElementById("myBidsModalBackdrop").classList.add("hidden");
}

function wireMyBidsModal() {
  document.getElementById("closeMyBidsModal").addEventListener("click", closeMyBidsModal);

  document.getElementById("myBidsModalBackdrop").addEventListener("click", event => {
    if (event.target.id === "myBidsModalBackdrop") {
      closeMyBidsModal();
    }
  });

  document.getElementById("myBidsForm").addEventListener("submit", submitMyBidsLookup);
}

async function submitMyBidsLookup(event) {
  event.preventDefault();

  const email = document.getElementById("myBidsEmail").value.trim();
  const message = document.getElementById("myBidsMessage");
  const results = document.getElementById("myBidsResults");
  const button = document.getElementById("myBidsSubmitButton");

  message.textContent = "";
  message.className = "form-message";
  results.innerHTML = "";

  if (!email) {
    message.textContent = "Please enter your email address.";
    message.classList.add("error");
    return;
  }

  localStorage.setItem(BIDDER_EMAIL_KEY, email);

  button.disabled = true;
  button.textContent = "Checking bids...";

  const response = await fetchMyBids(email);

  button.disabled = false;
  button.textContent = "View My Bids";

  if (!response.success) {
    message.textContent = response.message || "Unable to retrieve bids.";
    message.classList.add("error");
    return;
  }

  renderMyBids(response.bids);
}

function renderMyBids(bids) {
  const message = document.getElementById("myBidsMessage");
  const results = document.getElementById("myBidsResults");

  if (!bids.length) {
    message.textContent = "No bids found for that email address.";
    return;
  }

  results.innerHTML = bids.map(bid => {
    const isWinning = bid.status === "Winning";

    return `
      <div class="my-bid-card ${isWinning ? "winning" : "outbid"}">
        <div class="my-bid-status">
          ${isWinning ? "🟢 Winning" : "🔴 Outbid"}
        </div>

        <h3>${bid.title}</h3>

        <p>Your bid: <strong>$${bid.myBidAmount}</strong></p>

        ${
          isWinning
            ? `<p class="my-bid-note">You are currently the high bidder.</p>`
            : `<p class="my-bid-note">Current high bid: <strong>$${bid.currentHighBid}</strong></p>`
        }
      </div>
    `;
  }).join("");
}