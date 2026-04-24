import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Copy, ArrowUpRight, ArrowDownLeft, LogOut, RefreshCw, Coins, Clock, Settings } from "lucide-react";
import { NETWORKS, getBalance } from "../utils/crypto";
import { DEFAULT_TOKENS, getTokenBalance } from "../utils/tokens";
import { getTransactionHistory } from "../utils/history";

export default function Dashboard({ address, chainId, onChangeNetwork, onLock, onNavigate }) {
    const [balance, setBalance] = useState("0.0");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [tab, setTab] = useState("tokens"); // tokens | activity
    const [tokens, setTokens] = useState([]);
    const [txHistory, setTxHistory] = useState([]);
    const [txLoading, setTxLoading] = useState(false);

    const network = NETWORKS[chainId];

    const fetchBalance = async () => {
        setLoading(true);
        const bal = await getBalance(address, chainId);
        setBalance(bal);
        setLoading(false);
    };

    const fetchTokens = async () => {
        const tokenList = DEFAULT_TOKENS[chainId] || [];
        const results = await Promise.all(
            tokenList.map(async (t) => {
                const info = await getTokenBalance(t.address, address, chainId);
                return { ...t, balance: info.balance };
            })
        );
        setTokens(results);
    };

    const fetchHistory = async () => {
        setTxLoading(true);
        const txs = await getTransactionHistory(address, chainId);
        setTxHistory(txs);
        setTxLoading(false);
    };

    useEffect(() => {
        fetchBalance();
        fetchTokens();
    }, [chainId, address]);

    useEffect(() => {
        if (tab === "activity" && txHistory.length === 0) fetchHistory();
    }, [tab]);

    const copyAddr = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const shortAddr = `${address.slice(0, 6)}...${address.slice(-4)}`;

    const formatTime = (ts) => {
        const d = new Date(Number(ts) * 1000);
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    };

    return (
        <div className="flex flex-col h-screen bg-dark-900">
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b border-gray-800 bg-dark-800/60 backdrop-blur-md">
                <select className="bg-dark-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-brand-500 outline-none"
                    value={chainId} onChange={(e) => onChangeNetwork(e.target.value)}>
                    {Object.entries(NETWORKS).map(([id, net]) => (
                        <option key={id} value={id}>{net.name}</option>
                    ))}
                </select>
                <div className="flex items-center gap-2">
                    <button onClick={() => onNavigate("settings")} className="text-gray-400 hover:text-white transition-colors" title="Settings">
                        <Settings className="w-4.5 h-4.5" />
                    </button>
                    <button onClick={onLock} className="text-gray-400 hover:text-white transition-colors" title="Lock Wallet">
                        <LogOut className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>

            {/* Account Chip */}
            <div className="flex justify-center pt-5 pb-2">
                <button onClick={copyAddr}
                    className="bg-dark-800 px-4 py-1.5 rounded-full flex items-center gap-2 cursor-pointer hover:bg-gray-800 transition-colors border border-gray-700">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="text-sm font-mono text-gray-300">{shortAddr}</span>
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                    {copied && <span className="text-xs text-green-400">✓</span>}
                </button>
            </div>

            {/* Balance */}
            <div className="text-center mb-6 px-6 relative group">
                <h2 className="text-4xl font-bold text-white mb-1 tracking-tight">
                    {loading ? "..." : parseFloat(balance).toFixed(4)}
                </h2>
                <p className="text-lg text-brand-500 font-medium">{network.symbol}</p>
                <button onClick={fetchBalance} className="absolute -right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mb-6 px-6">
                <button onClick={() => onNavigate("send")} className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-full bg-brand-600 group-hover:bg-brand-500 flex items-center justify-center transition-all shadow-lg shadow-brand-500/20">
                        <ArrowUpRight className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-400">Send</span>
                </button>
                <button onClick={() => onNavigate("receive")} className="flex flex-col items-center gap-1.5 group">
                    <div className="w-12 h-12 rounded-full bg-dark-800 group-hover:bg-gray-800 border border-gray-700 flex items-center justify-center transition-all">
                        <ArrowDownLeft className="w-5 h-5 text-brand-500" />
                    </div>
                    <span className="text-xs font-medium text-gray-400">Receive</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800 px-6">
                <button onClick={() => setTab("tokens")}
                    className={`flex-1 pb-2 text-sm font-medium text-center border-b-2 transition-colors ${tab === "tokens" ? "border-brand-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
                    <Coins className="w-4 h-4 inline mr-1.5 -mt-0.5" />Tokens
                </button>
                <button onClick={() => setTab("activity")}
                    className={`flex-1 pb-2 text-sm font-medium text-center border-b-2 transition-colors ${tab === "activity" ? "border-brand-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
                    <Clock className="w-4 h-4 inline mr-1.5 -mt-0.5" />Activity
                </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {tab === "tokens" && (
                    <div className="space-y-2">
                        {/* Native token */}
                        <div className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl border border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                    {network.symbol.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{network.symbol}</p>
                                    <p className="text-xs text-gray-500">{network.name}</p>
                                </div>
                            </div>
                            <p className="text-sm font-mono text-white">{parseFloat(balance).toFixed(4)}</p>
                        </div>
                        {/* ERC-20 Tokens */}
                        {tokens.map((t, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl border border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">
                                        {t.symbol.charAt(0)}
                                    </div>
                                    <p className="text-sm font-medium text-white">{t.symbol}</p>
                                </div>
                                <p className="text-sm font-mono text-white">{parseFloat(t.balance).toFixed(2)}</p>
                            </div>
                        ))}
                        {tokens.length === 0 && chainId === "11155111" && (
                            <p className="text-center text-gray-500 text-xs mt-4">Testnet — no default tokens listed.</p>
                        )}
                    </div>
                )}

                {tab === "activity" && (
                    <div className="space-y-2">
                        {txLoading && <div className="text-center py-8"><RefreshCw className="w-5 h-5 animate-spin text-gray-500 mx-auto" /></div>}
                        {!txLoading && txHistory.length === 0 && (
                            <p className="text-center text-gray-500 text-sm mt-8">No transactions found.</p>
                        )}
                        {txHistory.map((tx, i) => (
                            <a key={i} href={`${network.explorer}/tx/${tx.hash}`} target="_blank" rel="noreferrer"
                                className="flex items-center justify-between p-3 bg-dark-800/50 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.direction === "out" ? "bg-red-900/30" : "bg-green-900/30"}`}>
                                        {tx.direction === "out"
                                            ? <ArrowUpRight className="w-4 h-4 text-red-400" />
                                            : <ArrowDownLeft className="w-4 h-4 text-green-400" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{tx.direction === "out" ? "Sent" : "Received"}</p>
                                        <p className="text-xs text-gray-500">{formatTime(tx.timeStamp)}</p>
                                    </div>
                                </div>
                                <p className={`text-sm font-mono ${tx.direction === "out" ? "text-red-400" : "text-green-400"}`}>
                                    {tx.direction === "out" ? "-" : "+"}{parseFloat(ethers.formatEther(tx.value)).toFixed(4)}
                                </p>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
