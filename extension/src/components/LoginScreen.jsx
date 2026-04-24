import { useState } from "react";
import { RefreshCw } from "lucide-react";

export default function LoginScreen({ onLogin }) {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            await onLogin(password);
            setPassword("");
        } catch (e) {
            setError("Incorrect password");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-screen p-6 justify-center">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-brand-500 to-blue-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
                    <span className="text-2xl font-black text-white">B</span>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                <p className="text-gray-400">Unlock your BitForge wallet</p>
            </div>
            <input type="password" placeholder="Password"
                className="w-full bg-dark-800 border border-gray-700 rounded-xl p-3 text-white mb-4 focus:ring-2 focus:ring-brand-500 outline-none"
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
            <button onClick={handleSubmit} disabled={loading}
                className="w-full bg-brand-600 hover:bg-brand-500 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-xl transition-all flex justify-center">
                {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : "Unlock"}
            </button>
        </div>
    );
}
