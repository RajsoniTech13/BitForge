import { NETWORKS } from "./crypto";

/**
 * Fetches transaction history from Etherscan-compatible block explorer APIs.
 * Works with Ethereum Mainnet, Sepolia, and Polygonscan.
 *
 * NOTE: These free endpoints have rate limits (~5 req/sec).
 * For production, you should add an Etherscan API key.
 *
 * @param {string} address - The wallet address.
 * @param {string} chainId - The chain ID (e.g. "1", "11155111", "137").
 * @returns {Promise<Array>} Array of transaction objects.
 */

const EXPLORER_APIS = {
    "1": "https://api.etherscan.io/api",
    "11155111": "https://api-sepolia.etherscan.io/api",
    "137": "https://api.polygonscan.com/api"
};

export const getTransactionHistory = async (address, chainId) => {
    const apiBase = EXPLORER_APIS[chainId];
    if (!apiBase) return [];

    try {
        const url = `${apiBase}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status === "1" && Array.isArray(data.result)) {
            return data.result.map(tx => ({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                value: tx.value,  // in wei
                timeStamp: tx.timeStamp,
                isError: tx.isError === "1",
                gasUsed: tx.gasUsed,
                gasPrice: tx.gasPrice,
                // Determine if this was a send or receive relative to our address
                direction: tx.from.toLowerCase() === address.toLowerCase() ? "out" : "in"
            }));
        }
        return [];
    } catch (e) {
        console.error("Failed to fetch tx history:", e);
        return [];
    }
};
