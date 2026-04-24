import { useState } from "react";
import { ShieldAlert, RefreshCw, Copy } from "lucide-react";

export default function CreateScreen({ seedPhrase, onComplete }) {
    const [password, setPassword] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(seedPhrase);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async () => {
        if (!password || password.length < 8) { setError("Password must be at least 8 characters"); return; }
        if (password !== confirmPwd) { setError("Passwords do not match"); return; }
        setLoading(true);
        setError("");
        try {
            await onComplete(password);
        } catch (e) {
            setError(e.message);
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-screen p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Secret Recovery Phrase</h2>
            <div className="bg-dark-800 p-4 rounded-xl border border-gray-700 mb-2 relative">
                <p className="text-gray-200 font-mono text-center tracking-wide leading-relaxed text-sm">{seedPhrase}</p>
            </div>
            <button onClick={handleCopy} className="text-brand-500 text-xs flex items-center gap-1 mx-auto mb-4 hover:text-brand-400">
                <Copy className="w-3 h-3" /> {copied ? "Copied!" : "Copy to clipboard"}
            </button>
            <div className="bg-orange-900/20 border border-orange-500/30 p-3 rounded-xl mb-4 flex items-start gap-3">
                <ShieldAlert className="text-orange-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-200">Never share this phrase. Anyone with it can steal your assets.</p>
            </div>
            <div className="mt-auto space-y-3">
                <input type="password" placeholder="Create Password (min 8 chars)"
                    className="w-full bg-dark-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    value={password} onChange={(e) => setPassword(e.target.value)} />
                <input type="password" placeholder="Confirm Password"
                    className="w-full bg-dark-800 border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-brand-500 outline-none"
                    value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button onClick={handleSubmit} disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all flex justify-center">
                    {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : "I've Saved It — Secure Wallet"}
                </button>
            </div>
        </div>
    );
}
