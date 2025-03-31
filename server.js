import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Web3 from "web3";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Environment variable validation
const ETHEREUM_RPC = process.env.ETHEREUM_RPC;
const SOLANA_RPC = process.env.SOLANA_RPC;

if (!ETHEREUM_RPC) {
    console.error("Error: ETHEREUM_RPC is not set in .env");
    process.exit(1);
}
if (!SOLANA_RPC) {
    console.error("Error: SOLANA_RPC is not set in .env");
    process.exit(1);
}

// 🟢 Ethereum Web3 Setup
let web3;
try {
    web3 = new Web3(new Web3.providers.HttpProvider(ETHEREUM_RPC));
    console.log("Ethereum Web3 initialized successfully");
} catch (error) {
    console.error("Failed to initialize Ethereum Web3:", error.message);
    process.exit(1);
}

// 🟣 Solana Setup
let solanaConnection;
try {
    solanaConnection = new Connection(SOLANA_RPC, "confirmed");
    console.log("Solana Connection initialized successfully");
} catch (error) {
    console.error("Failed to initialize Solana Connection:", error.message);
    process.exit(1);
}

// 🟡 Create Ethereum Wallet
app.get("/create-ethereum-wallet", (req, res) => {
    try {
        const account = web3.eth.accounts.create();
        const wallet = {
            id: Date.now(), // Add unique ID
            address: account.address,
            privateKey: account.privateKey
        };
        console.log(`Created Ethereum wallet: ${wallet.address}`);
        res.json(wallet);
    } catch (error) {
        console.error("Error creating Ethereum wallet:", error.message);
        res.status(500).json({ error: `Failed to create Ethereum wallet: ${error.message}` });
    }
});

// 🔵 Connect to Ethereum Wallet
app.post("/connect-ethereum-wallet", (req, res) => {
    try {
        const { privateKey } = req.body;
        if (!privateKey) throw new Error("Private key is required");
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        const wallet = {
            id: Date.now(), // Add unique ID
            address: account.address,
            privateKey: account.privateKey
        };
        console.log(`Connected Ethereum wallet: ${wallet.address}`);
        res.json(wallet);
    } catch (error) {
        console.error("Error connecting Ethereum wallet:", error.message);
        res.status(400).json({ error: `Invalid Ethereum private key: ${error.message}` });
    }
});

// 🔵 Create Solana Wallet
app.get("/create-solana-wallet", (req, res) => {
    try {
        const keypair = Keypair.generate();
        const wallet = {
            id: Date.now(), // Add unique ID
            address: keypair.publicKey.toBase58(),
            privateKey: Buffer.from(keypair.secretKey).toString("hex")
        };
        console.log(`Created Solana wallet: ${wallet.address}`);
        res.json(wallet);
    } catch (error) {
        console.error("Error creating Solana wallet:", error.message);
        res.status(500).json({ error: `Failed to create Solana wallet: ${error.message}` });
    }
});

// 🟠 Connect to Solana Wallet
app.post("/connect-solana-wallet", (req, res) => {
    try {
        const { privateKey } = req.body;
        if (!privateKey) throw new Error("Private key is required");
        const secretKeyArray = Uint8Array.from(privateKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const keypair = Keypair.fromSecretKey(secretKeyArray);
        const wallet = {
            id: Date.now(), // Add unique ID
            address: keypair.publicKey.toBase58(),
            privateKey: privateKey
        };
        console.log(`Connected Solana wallet: ${wallet.address}`);
        res.json(wallet);
    } catch (error) {
        console.error("Error connecting Solana wallet:", error.message);
        res.status(400).json({ error: `Invalid Solana private key: ${error.message}` });
    }
});

// 🟢 Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
}).on("error", (err) => {
    console.error(`Failed to start server on port ${PORT}:`, err.message);
    process.exit(1);
});