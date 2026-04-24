import { ethers } from "ethers";

// Default Networks
const NETWORKS = {
    "1": { name: "Ethereum Mainnet", rpc: "https://cloudflare-eth.com", chainId: "0x1" },
    "11155111": { name: "Sepolia Testnet", rpc: "https://rpc.sepolia.org", chainId: "0xaa36a7" },
    "137": { name: "Polygon Mainnet", rpc: "https://polygon-rpc.com", chainId: "0x89" },
};

let provider = new ethers.JsonRpcProvider(NETWORKS["11155111"].rpc);
let currentChainId = "11155111";

async function getAppState() {
    return new Promise((resolve) => {
        chrome.storage.local.get(["vault", "activeAccount", "chainId"], (result) => {
            if (result.chainId && result.chainId !== currentChainId) {
                currentChainId = result.chainId;
                provider = new ethers.JsonRpcProvider(NETWORKS[currentChainId].rpc);
            }
            resolve({
                vault: result.vault,
                activeAccount: result.activeAccount,
                chainId: currentChainId
            });
        });
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "RPC_REQUEST") {
        handleRpcRequest(message.payload, sender).then(sendResponse).catch(err => {
            sendResponse({ error: err.message });
        });
        return true; // Keep message channel open for async response
    }
});

async function handleRpcRequest(payload, sender) {
    const { method, params } = payload;
    const state = await getAppState();

    switch (method) {
        case "eth_accounts":
        case "eth_requestAccounts":
            if (state.activeAccount) {
                return { result: [state.activeAccount.address] };
            }
            // For a real extension, we would pop up a window asking for permission if not connected.
            // For simplicity, we just return empty array if no account is unlocked.
            return { result: [] };

        case "eth_chainId":
            return { result: ethers.toBeHex(BigInt(state.chainId)) };

        case "eth_sendTransaction":
            // In a real wallet, this pops up a confirmation window.
            throw new Error("BitForge: eth_sendTransaction not implemented yet. Use the extension UI to send funds.");

        case "eth_call":
            return { result: await provider.send("eth_call", params) };

        case "eth_estimateGas":
            return { result: await provider.send("eth_estimateGas", params) };

        case "eth_gasPrice":
            return { result: await provider.send("eth_gasPrice", params) };

        case "eth_blockNumber":
            return { result: await provider.send("eth_blockNumber", params) };

        case "eth_getBalance":
            return { result: await provider.send("eth_getBalance", params) };

        default:
            console.warn("BitForge: Method not implemented", method);
            throw new Error("Method not implemented");
    }
}

// Function to notify tabs of state changes (e.g. account switched)
export async function notifyStateChange(method, params) {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, {
            type: "STATE_UPDATE",
            method,
            params
        }).catch(() => {}); // Ignore errors for inactive tabs
    }
}
