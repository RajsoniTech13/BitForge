import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function ImportScreen({ onImport, onBack }) {
    const [seedPhrase, setSeedPhrase] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!seedPhrase.trim()) { setError("Please enter your seed phrase"); return; }
        if (!password || password.length < 8) { setError("Password must be at least 8 characters"); return; }
        setLoading(true);
        setError("");
        try {
            await onImport(seedPhrase.trim(), password);
        } catch (e) {
            setError("Invalid seed phrase");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-screen p-6">
            <h2 className="text-xl font-bold text-white mb-4">Import Wallet</h2>
            <textarea placeholder="Enter your secret recovery phrase..."
                className="w-full bg-dark-800 border border-gray-700 rounded-xl p-3 text-white mb-4 h-32 resize-none focus:ring-2 focus:ring-brand-500 outline-none font-mono text-sm"
                value={seedPhrase} onChange={(e) => setSeedPhrase(e.target.value)} />
            <input type="password" placeholder="Create Password (min 8 chars)"
                className="w-full bg-dark-800 border border-gray-700 rounded-xl p-3 text-white mb-4 focus:ring-2 focus:ring-brand-500 outline-none"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="mt-auto flex gap-3">
                <button onClick={onBack}
                    className="flex-1 bg-dark-800 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-xl border border-gray-700 transition-all">
                    Back
                </button>
                <button onClick={handleSubmit} disabled={loading}
                    className="flex-[2] bg-brand-600 hover:bg-brand-500 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all flex justify-center">
                    {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : "Import"}
                </button>
            </div>
        </div>
    );
}
