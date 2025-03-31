chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    if (message.action === "connect") {
        const blockchain = message.blockchain;
        console.log(`Received connect request for ${blockchain}`);
        chrome.storage.local.set({ selectedBlockchain: blockchain }, () => {
            console.log(`Stored blockchain: ${blockchain}`);
            sendResponse({ success: true });
        });
    } else if (message.action === "getWallets") {
        const blockchain = message.blockchain;
        console.log(`Received request for ${blockchain} wallets`);
        chrome.storage.local.get([`${blockchain}_wallets`], (result) => {
            const wallets = result[`${blockchain}_wallets`] || [];
            console.log(`Sending ${blockchain} wallets:`, wallets);
            sendResponse({ success: true, wallets: wallets });
        });
    } else {
        sendResponse({ success: false, error: "Unknown action" });
    }
    return true; // Keep the message channel open for async response
});