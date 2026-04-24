import { useState } from "react";
import { ArrowLeft, Trash2, Globe, Shield } from "lucide-react";
import { NETWORKS } from "../utils/crypto";

export default function SettingsScreen({ address, chainId, onBack, onReset }) {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleReset = () => {
        // Wipe all wallet data
        if (typeof chrome !== "undefined" && chrome.storage) {
            chrome.storage.local.clear();
        }
        localStorage.clear();
        onReset();
    };

    return (
        <div className="flex flex-col h-screen p-6">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-white mx-auto pr-5">Settings</h2>
            </div>

            <div className="space-y-3">
                {/* Network Info */}
                <div className="bg-dark-800 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Globe className="w-5 h-5 text-brand-500" />
                        <h3 className="font-medium text-white">Network</h3>
                    </div>
                    <p className="text-sm text-gray-400 ml-8">{NETWORKS[chainId]?.name || "Unknown"}</p>
                    <p className="text-xs text-gray-500 ml-8 mt-1 font-mono">Chain ID: {chainId}</p>
                </div>

                {/* Security Info */}
                <div className="bg-dark-800 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        <h3 className="font-medium text-white">Security</h3>
                    </div>
                    <p className="text-sm text-gray-400 ml-8">Private key is AES-128-CTR encrypted and stored locally.</p>
                    <p className="text-sm text-gray-400 ml-8 mt-1">Raw keys are never saved to disk.</p>
                </div>

                {/* Wallet Address */}
                <div className="bg-dark-800 border border-gray-700 rounded-xl p-4">
                    <h3 className="font-medium text-white text-sm mb-1">Wallet Address</h3>
                    <p className="text-xs text-gray-400 font-mono break-all">{address}</p>
                </div>

                {/* Version */}
                <div className="bg-dark-800 border border-gray-700 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-sm text-gray-400">Version</span>
                    <span className="text-sm text-white font-mono">1.0.0</span>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-auto">
                {!showConfirm ? (
                    <button onClick={() => setShowConfirm(true)}
                        className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 font-medium py-3 px-4 rounded-xl border border-red-900/30 transition-all flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" /> Reset Wallet
                    </button>
                ) : (
                    <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-xl">
                        <p className="text-sm text-red-300 mb-3 text-center">This will permanently delete your wallet. Make sure you have your seed phrase backed up!</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirm(false)}
                                className="flex-1 bg-dark-800 text-white py-2 rounded-xl border border-gray-700 text-sm">Cancel</button>
                            <button onClick={handleReset}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl text-sm">Confirm Delete</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
