//------------------------------------
// Google Apps Script API
//------------------------------------
//------------------------------------
// Google Apps Script API
//------------------------------------

async function fetchAuctionItems() {

    try {

        const response = await fetch(
            `${CONFIG.apiUrl}?action=getItems`
        );

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