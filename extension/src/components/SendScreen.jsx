import { useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { NETWORKS, sendTransaction, getBalance } from "../utils/crypto";

export default function SendScreen({ wallet, chainId, onBack }) {
    const [sendTo, setSendTo] = useState("");
    const [sendAmount, setSendAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [txHash, setTxHash] = useState("");
    const [balance, setBalance] = useState(null);

    const network = NETWORKS[chainId];

    const loadBalance = async () => {
        const bal = await getBalance(wallet.address, chainId);
        setBalance(bal);
    };
    if (balance === null) loadBalance();

    const handleSend = async () => {
        if (!sendTo || !sendAmount) { setError("Please fill all fields"); return; }
        setLoading(true);
        setError("");
        setTxHash("");
        try {
            const hash = await sendTransaction(wallet, sendTo, sendAmount, chainId);
            setTxHash(hash);
            setSendTo("");
            setSendAmount("");
        } catch (e) {
            const msg = e.message || "Unknown error";
            setError("Transaction failed: " + msg.substring(0, 80));
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-screen p-6">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-white mx-auto pr-5">Send {network.symbol}</h2>
            </div>

            <div className="space-y-4 mb-6">
                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Recipient Address</label>
                    <input type="text" placeholder="0x..."
                        className="w-full bg-dark-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm"
                        value={sendTo} onChange={(e) => setSendTo(e.target.value)} />
                </div>
                <div>
                    <label className="text-sm text-gray-400 mb-1 block">Amount ({network.symbol})</label>
                    <div className="relative">
                        <input type="number" placeholder="0.0" step="0.0001"
                            className="w-full bg-dark-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                            value={sendAmount} onChange={(e) => setSendAmount(e.target.value)} />
                        <button onClick={() => balance && setSendAmount(balance)}
                            className="absolute right-3 top-3 text-brand-500 text-sm font-medium hover:text-brand-400">MAX</button>
                    </div>
                </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4 bg-red-500/10 p-3 rounded-lg border border-red-500/20 break-words">{error}</p>}

            {txHash ? (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center">
                    <p className="text-green-400 font-medium mb-2">Transaction Sent!</p>
                    <a href={`${network.explorer}/tx/${txHash}`} target="_blank" rel="noreferrer"
                        className="text-brand-500 text-sm hover:underline break-all">{txHash}</a>
                </div>
            ) : (
                <div className="mt-auto">
                    {balance && (
                        <div className="flex justify-between text-sm text-gray-400 mb-4 px-2">
                            <span>Available:</span>
                            <span className="font-mono">{parseFloat(balance).toFixed(4)} {network.symbol}</span>
                        </div>
                    )}
                    <button onClick={handleSend} disabled={loading || !sendTo || !sendAmount}
                        className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all flex justify-center">
                        {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : "Confirm Send"}
                    </button>
                </div>
            )}
        </div>
    );
}
