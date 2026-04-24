<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Ethers.js-3C3C3D?style=for-the-badge&logo=ethereum&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
</p>

# BitForge — Professional Web3 Browser Wallet

> **A production-grade Ethereum & Polygon wallet extension.**  
> Securely manage assets → Connect to any dApp → Switch networks seamlessly → Encrypt keys locally.

---

## 📑 Table of Contents

- [Quick Start](#🚀-quick-start)
- [Core Features](#💎-core-features)
- [Security Architecture](#🛡️-security-architecture)
- [Tech Stack](#🛠️-tech-stack)
- [Project Structure](#📁-project-structure)
- [DApp Integration (EIP-1193)](#📡-dapp-integration-eip-1193)
- [Environment & Setup](#⚙️-environment--setup)
- [GitHub Upload Guide](#📤-github-upload-guide)

---

## 🚀 Quick Start

### 1. Load the Extension (Chrome/Brave)
1. Go to `chrome://extensions`.
2. Enable **Developer Mode** (top right).
3. Click **Load unpacked** and select the `/extension/dist` folder in this project.
4. Pin **BitForge** to your browser toolbar.

### 2. Start the Demo dApp
```bash
cd dapp
npm install
npm run dev
```
> 🟢 **Wallet Extension:** Load from `/extension/dist`  
> 🟢 **Demo Website:** http://localhost:3000

---

## 💎 Core Features

- **HD Wallet (BIP-39):** Generate 12-word seed phrases or import existing ones.
- **Multi-Network Support:** Switch between Ethereum Mainnet, Sepolia Testnet, Polygon Mainnet, and Amoy Testnet.
- **ERC-20 Support:** Real-time balance fetching and transfers for USDT, USDC, and DAI.
- **Transaction History:** Live activity feed fetched via Etherscan-compatible APIs.
- **QR Code Support:** Instant QR generation for receiving funds.
- **Modern UI:** Premium glassmorphism design with Lucide-react professional icons.

---

## 🛡️ Security Architecture

BitForge prioritizes user safety with a **non-custodial** approach:

- **Local Encryption:** Private keys are encrypted using **AES-128-CTR** with the user's password.
- **Zero-Storage Policy:** Raw private keys or seed phrases are **never** stored on disk. They only exist in memory temporarily when the wallet is "Unlocked."
- **Sandbox Isolation:** Uses a dedicated Background Service Worker to process sensitive blockchain logic, isolated from the website's context.

---

## 🛠 Tech Stack

### Wallet Extension
| Component | Technology |
|-----------|-----------|
| Library | Ethers.js v6 |
| Framework | React 18 |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |

### Demo dApp
| Component | Technology |
|-----------|-----------|
| Framework | Next.js 14 |
| Connection | EIP-1193 Provider |
| Discovery | EIP-6963 (Multi-Wallet) |

---

## 📁 Project Structure

```
BitForge/
├── extension/                # 🧩 Chrome Extension Wallet
│   ├── src/
│   │   ├── components/       # Dashboard, Send, Receive, etc.
│   │   ├── utils/            # Crypto, Tokens, and History logic
│   │   └── background.js     # Service Worker (The Brain)
│   ├── public/               # manifest.json & static assets
│   └── dist/                 # Production-ready extension build
│
└── dapp/                     # ⚛️ Demo React Application
    ├── src/
    │   └── app/              # Connect UI & Balance Logic
    └── public/               # SEO & Static assets
```

---

## 📡 DApp Integration (EIP-1193)

BitForge injects a standard Ethereum provider, allowing any Web3 app to connect using:

```javascript
// BitForge automatically populates this
const provider = window.ethereum; 

// Request connection
const accounts = await provider.request({ method: 'eth_requestAccounts' });
console.log("Connected to BitForge:", accounts[0]);
```

---

## ⚙️ Environment & Setup

- **RPC Nodes:** Uses public endpoints for Ethereum and Polygon.
- **Explorers:** Integrated with Etherscan and Polygonscan APIs for history.
- **Node Version:** 18.x or higher recommended.

---

## 📤 GitHub Upload Guide

To push this project to your GitHub:

1. **Initialize Git:**
   ```bash
   git init
   git add .
   git commit -m "feat: complete BitForge Web3 Wallet with HD support and dApp injection"
   ```
2. **Link and Push:**
   ```bash
   git branch -M main
   git remote add origin https://github.com/YourUsername/BitForge.git
   git push -u origin main
   ```

---

<p align="center">
  Built with ❤️ for the Web3 Ecosystem by <strong>Raj Soni</strong>
</p>
