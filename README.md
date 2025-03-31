# BitForge Wallet

A Chrome extension and React web application for managing Ethereum and Solana wallets with basicINS transaction capabilities.

## Features
- Create and manage Ethereum and Solana wallets
- Initial gift balance (0.5 ETH or 5 SOL) for new wallets
- Send transactions between wallets
- View wallet balances
- Secure private key handling
- React-based companion web interface

## Prerequisites
- Node.js (v16 or higher recommended)
- npm (v8 or higher recommended)
- Google Chrome browser
- Git

## Installation and Setup

### Step 1: Start the Server
The server handles API requests for wallet operations.
```
1. Clone the repository:
bash
git clone https://github.com//BitForge.git

2. Install server dependencies:

npm install

3. Create a .env file in the root directory with:

ETHEREUM_RPC=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
SOLANA_RPC=https://api.mainnet-beta.solana.com
PORT=3000

4. Run the server:

node server.js

5. Start the React Web Application

	5.1 cd react-wallet-connector
	5.2 npm install
	5.3 npm run dev

6. Load the Chrome Extension
	6.1 Open Google Chrome
	6.2 Go to chrome://extensions/
	6.3 Enable "Developer mode" in the top right corner
	6.4 Click "Load unpacked" and select the root directory of this repository (where manifest.json is located)
	6.5 The BitForge Wallet extension should now appear in your extensions list


###
Created by [Jaiditya Chauhan, Raj Soni, Jenish Tank] - [Jaiditya-01, RajsoniTech13, Jenish711]
