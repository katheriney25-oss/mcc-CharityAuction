//------------------------------------
// Google Apps Script API
//------------------------------------
//------------------------------------
// Google Apps Script API
//------------------------------------

async function fetchAuctionItems() {

    try {

        const response = await fetch(CONFIG.apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain;charset=UTF-8"
          },
          body: JSON.stringify({
            action: "getItems"
          })
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message);
        }

        return data.items;

    } catch (error) {

        console.error("Unable to load auction items:", error);

        return [];

    }

}

async function submitItem(donation) {
  try {
    const response = await fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8"
      },
      body: JSON.stringify({
        action: "submitItem",
        ...donation
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error("Unable to submit item:", error);

    return {
      success: false,
      message: "Unable to submit item. Please try again."
    };
  }
}

async function submitBid(bidData) {
  try {
    const response = await fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8"
      },
      body: JSON.stringify({
        action: "submitBid",
        ...bidData
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error("Unable to submit bid:", error);

    return {
      success: false,
      message: "Unable to submit bid. Please try again."
    };
  }
}

async function fetchMyBids(bidderEmail) {

  try {

    const response = await fetch(CONFIG.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=UTF-8"
      },
      body: JSON.stringify({
        action: "getMyBids",
        bidderEmail
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return data;

  } catch (error) {

    console.error("Unable to retrieve bids:", error);

    return {
      success: false,
      message: "Unable to retrieve bids."
    };

  }

}