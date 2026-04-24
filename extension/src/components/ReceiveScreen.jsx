import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Copy } from "lucide-react";
import { NETWORKS } from "../utils/crypto";

export default function ReceiveScreen({ address, chainId, onBack }) {
    const [copied, setCopied] = useState(false);
    const network = NETWORKS[chainId];

    const copyAddr = () => {
        navigator.clipboard.writeText(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-screen p-6">
            <div className="flex items-center mb-8">
                <button onClick={onBack} className="text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-white mx-auto pr-5">Receive</h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-2xl mb-8 shadow-xl shadow-brand-500/10">
                    <QRCodeSVG value={address} size={180} />
                </div>

                <div className="bg-dark-800 border border-gray-700 rounded-xl p-4 w-full text-center">
                    <p className="text-sm text-gray-400 mb-2">Your Address</p>
                    <p className="font-mono text-sm text-white break-all mb-4 leading-relaxed px-2">{address}</p>
                    <button onClick={copyAddr}
                        className="text-brand-500 font-medium hover:text-brand-400 text-sm flex items-center justify-center gap-2 mx-auto">
                        <Copy className="w-4 h-4" /> {copied ? "Copied!" : "Copy Address"}
                    </button>
                </div>
                <p className="text-center text-xs text-gray-500 mt-6 max-w-[250px]">
                    Send only {network.name} assets to this address.
                </p>
            </div>
        </div>
    );
}
