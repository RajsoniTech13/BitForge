import { RefreshCw } from "lucide-react";

export default function WelcomeScreen({ onCreateNew, onImport }) {
    return (
        <div className="flex flex-col h-screen p-6 justify-center text-center">
            <div className="mb-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-500 to-blue-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
                    <span className="text-3xl font-black text-white">B</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">BitForge</h1>
                <p className="text-gray-400">The gateway to the decentralized web.</p>
            </div>
            <button
                onClick={onCreateNew}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium py-3 px-4 rounded-xl mb-4 transition-all"
            >
                Create New Wallet
            </button>
            <button
                onClick={onImport}
                className="w-full bg-dark-800 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-xl border border-gray-700 transition-all"
            >
                Import Existing Wallet
            </button>
        </div>
    );
}
