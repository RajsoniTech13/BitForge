import { useState, useEffect } from "react";
import { generateSeedPhrase, createWalletFromMnemonic, decryptWallet } from "./utils/crypto";

// Components
import InitScreen from "./components/InitScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import CreateScreen from "./components/CreateScreen";
import ImportScreen from "./components/ImportScreen";
import LoginScreen from "./components/LoginScreen";
import Dashboard from "./components/Dashboard";
import SendScreen from "./components/SendScreen";
import ReceiveScreen from "./components/ReceiveScreen";
import SettingsScreen from "./components/SettingsScreen";

/**
 * App.jsx — Root component for the BitForge Wallet Extension.
 *
 * State machine views:
 *   init → welcome → create | import → login → dashboard → send | receive | settings
 */
export default function App() {
    const [view, setView] = useState("init");
    const [vault, setVault] = useState(null);       // Encrypted keystore JSON
    const [address, setAddress] = useState("");
    const [wallet, setWallet] = useState(null);      // Unlocked ethers.Wallet
    const [seedPhrase, setSeedPhrase] = useState("");
    const [chainId, setChainId] = useState("11155111"); // Default: Sepolia Testnet

    // ─── Storage helpers ─────────────────────────────────────────
    const saveToStorage = (data) => {
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.local.set(data);
        } else {
            Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, typeof v === "object" ? JSON.stringify(v) : v));
        }
    };

    const getFromStorage = (keys) => {
        return new Promise((resolve) => {
            if (typeof chrome !== "undefined" && chrome.storage) {
                chrome.storage.local.get(keys, resolve);
            } else {
                const result = {};
                keys.forEach(k => { const v = localStorage.getItem(k); if (v) result[k] = v; });
                resolve(result);
            }
        });
    };

    // ─── Initialization ──────────────────────────────────────────
    useEffect(() => {
        getFromStorage(["vault", "address", "chainId"]).then((result) => {
            if (result.vault) {
                setVault(result.vault);
                setAddress(result.address || "");
                if (result.chainId) setChainId(result.chainId);
                setView("login");
            } else {
                setView("welcome");
            }
        });
    }, []);

    // ─── Handlers ────────────────────────────────────────────────
    const handleCreateComplete = async (password) => {
        const { address: addr, encryptedJson } = await createWalletFromMnemonic(seedPhrase, password);
        saveToStorage({ vault: encryptedJson, address: addr });
        setVault(encryptedJson);
        setAddress(addr);
        setSeedPhrase("");
        setView("login");
    };

    const handleImport = async (phrase, password) => {
        const { address: addr, encryptedJson } = await createWalletFromMnemonic(phrase, password);
        saveToStorage({ vault: encryptedJson, address: addr });
        setVault(encryptedJson);
        setAddress(addr);
        setView("login");
    };

    const handleLogin = async (password) => {
        const w = await decryptWallet(vault, password);
        setWallet(w);
        saveToStorage({ activeAccount: { address: w.address } });
        setView("dashboard");
    };

    const handleLock = () => {
        setWallet(null);
        setView("login");
    };

    const handleChangeNetwork = (newChainId) => {
        setChainId(newChainId);
        saveToStorage({ chainId: newChainId });
    };

    const handleReset = () => {
        setVault(null);
        setAddress("");
        setWallet(null);
        setView("welcome");
    };

    // ─── View Router ─────────────────────────────────────────────
    switch (view) {
        case "init":
            return <InitScreen />;
        case "welcome":
            return <WelcomeScreen
                onCreateNew={() => { setSeedPhrase(generateSeedPhrase()); setView("create"); }}
                onImport={() => setView("import")} />;
        case "create":
            return <CreateScreen seedPhrase={seedPhrase} onComplete={handleCreateComplete} />;
        case "import":
            return <ImportScreen onImport={handleImport} onBack={() => setView("welcome")} />;
        case "login":
            return <LoginScreen onLogin={handleLogin} />;
        case "dashboard":
            return <Dashboard address={address} chainId={chainId}
                onChangeNetwork={handleChangeNetwork} onLock={handleLock}
                onNavigate={(v) => setView(v)} />;
        case "send":
            return <SendScreen wallet={wallet} chainId={chainId} onBack={() => setView("dashboard")} />;
        case "receive":
            return <ReceiveScreen address={address} chainId={chainId} onBack={() => setView("dashboard")} />;
        case "settings":
            return <SettingsScreen address={address} chainId={chainId}
                onBack={() => setView("dashboard")} onReset={handleReset} />;
        default:
            return null;
    }
}