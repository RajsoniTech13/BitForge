// Inject the web3 provider script into the webpage
const script = document.createElement("script");
script.src = chrome.runtime.getURL("assets/injectScript.js");
script.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Relay messages from the injected script to the background service worker
window.addEventListener("message", (event) => {
    if (event.source !== window || !event.data || event.data.target !== "bitforge-contentscript") return;

    // Send to background
    chrome.runtime.sendMessage({
        type: "RPC_REQUEST",
        payload: event.data
    }, (response) => {
        // Send back to injected script
        window.postMessage({
            target: "bitforge-injected",
            id: event.data.id,
            error: response?.error,
            result: response?.result
        }, "*");
    });
});

// Listen for background state changes and push them to injected script
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "STATE_UPDATE") {
        window.postMessage({
            target: "bitforge-injected",
            method: message.method,
            params: message.params
        }, "*");
    }
});
