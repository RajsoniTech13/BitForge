# BitForge Wallet: How It Works Internally

This document explains the technical architecture, security model, and communication flow of the BitForge Web3 Wallet.

## 1. Project Architecture
The project is split into two main parts:
*   **`/extension`**: The actual Chrome Extension (Wallet).
*   **`/dapp`**: A demo React application used to test the wallet connection.

## 2. The Browser Extension Core
The extension consists of three critical scripts that handle the "injection" and "background" logic:

### A. The Injector (`injectScript.js`)
*   **Role**: This script is "injected" directly into every website you visit.
*   **What it does**: It creates the `window.ethereum` and `window.bitforge` objects. 
*   **Standard Compliance**: It follows **EIP-1193** (Standard Provider API) and **EIP-6963** (Multi-Injected Provider Discovery). This is why dApps like Uniswap or your demo app can "see" BitForge.

### B. The Content Script (`contentScript.js`)
*   **Role**: Acts as the bridge (middleman).
*   **Why?**: Websites cannot talk directly to the extension's background logic due to security sandboxing.
*   **What it does**: It listens for messages from the website (via `window.postMessage`) and relays them to the background worker.

### C. The Service Worker (`background.js`)
*   **Role**: The "Brain" of the wallet.
*   **What it does**: 
    *   Maintains the connection to the blockchain (RPC nodes).
    *   Handles sensitive requests like `eth_requestAccounts`.
    *   Processes blockchain data in the background so the UI feels fast.

## 3. Security & Key Management
Security is the most important part of a crypto wallet.
*   **HD Wallet (BIP-39)**: BitForge uses `ethers.js` to generate a 12-word mnemonic (Seed Phrase). This follows the industry standard for hierarchical deterministic (HD) wallets.
*   **AES Encryption**: When you set a password, your Private Key is encrypted using **AES-128-CTR**. 
*   **Local Only**: Your raw private key is **never** stored. Only the "Encrypted JSON" is saved in Chrome's local storage. To use the wallet, you must provide your password to "unlock" (decrypt) the key in memory.

## 4. DApp Communication Flow
When you click **"Connect"** on a website:
1.  The DApp calls `window.ethereum.request({ method: 'eth_requestAccounts' })`.
2.  `injectScript.js` sends this request to `contentScript.js`.
3.  `contentScript.js` sends it to `background.js`.
4.  `background.js` checks if your wallet is unlocked and returns your address.
5.  The DApp receives the address and displays your balance!

## 5. Development Stack
*   **Frontend**: React + Vite (for speed).
*   **Styling**: Tailwind CSS (for modern UI).
*   **Blockchain**: Ethers.js (v6) — the most trusted library in Web3.
*   **Icons**: Lucide-react.
