import { useState, useEffect } from "react";
import "./App.css";

function App() {
    const [blockchain, setBlockchain] = useState("ethereum");
    const [wallets, setWallets] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const extensionId = "apgmkpmnobhalooihaibkfglfmabjonj";

    const loadWallets = () => {
        if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
            console.log(`Requesting ${blockchain} wallets from extension`);
            window.chrome.runtime.sendMessage(
                extensionId,
                { action: "getWallets", blockchain: blockchain },
                (response) => {
                    if (window.chrome.runtime.lastError) {
                        console.error("Extension error:", window.chrome.runtime.lastError);
                        setErrorMessage("Failed to fetch wallets. Ensure the BitForge Wallet extension is installed.");
                        setWallets([]);
                    } else if (response && response.success) {
                        console.log(`Received ${blockchain} wallets:`, response.wallets);
                        setWallets(response.wallets || []);
                        setErrorMessage("");
                    } else {
                        console.error("Failed to fetch wallets:", response?.error);
                        setErrorMessage("Failed to fetch wallets: " + (response?.error || "Unknown error"));
                        setWallets([]);
                    }
                }
            );
        } else {
            setErrorMessage("This app requires Chrome with the BitForge Wallet extension installed.");
            setWallets([]);
        }
    };

    const handleConnect = () => {
        if (window.chrome && window.chrome.runtime && window.chrome.runtime.sendMessage) {
            console.log(`Sending connect request for ${blockchain}`);
            window.chrome.runtime.sendMessage(
                extensionId,
                { action: "connect", blockchain: blockchain },
                (response) => {
                    if (window.chrome.runtime.lastError) {
                        console.error("Extension error:", window.chrome.runtime.lastError);
                        setErrorMessage("Please install the BitForge Wallet extension.");
                    } else if (response && response.success) {
                        console.log("Extension connected:", response);
                        setIsConnected(true);
                        loadWallets();
                        alert(
                            `Connected to ${blockchain}. Create or manage wallets in the BitForge Wallet extension popup.`
                        );
                    } else {
                        console.error("Connection failed:", response?.error);
                        setErrorMessage("Failed to connect to the wallet extension.");
                    }
                }
            );
        } else {
            setErrorMessage("This app requires Chrome with the BitForge Wallet extension installed.");
        }
    };

    useEffect(() => {
        if (isConnected) {
            loadWallets();
        }
    }, [blockchain, isConnected]);

    return (
        <div className="app">
            <h1>Wallet Connector</h1>
            <div className="container">
                <label htmlFor="blockchain">Select Blockchain:</label>
                <select
                    id="blockchain"
                    value={blockchain}
                    onChange={(e) => setBlockchain(e.target.value)}
                >
                    <option value="ethereum">Ethereum</option>
                    <option value="solana">Solana</option>
                </select>
                <button onClick={handleConnect}>Connect</button>
            </div>

            {isConnected && (
                <div className="wallet-list">
                    <h2>{blockchain.charAt(0).toUpperCase() + blockchain.slice(1)} Wallets</h2>
                    {errorMessage ? (
                        <p className="error">{errorMessage}</p>
                    ) : wallets.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Address</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {wallets.map((wallet) => (
                                    <tr key={wallet.id}>
                                        <td>{wallet.id}</td>
                                        <td>{wallet.address}</td>
                                        <td>{wallet.balance} {blockchain === "ethereum" ? "ETH" : "SOL"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No wallets found for {blockchain}. Create one in the extension popup.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;