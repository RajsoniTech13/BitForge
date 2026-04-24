"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBitForge, setIsBitForge] = useState(false);

  useEffect(() => {
    // Check if injected provider is available
    if (typeof window !== "undefined" && window.ethereum) {
      if ((window.ethereum as any).isBitForge) {
        setIsBitForge(true);
      }
      
      const eth = window.ethereum as any;
      eth.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          fetchBalance(accounts[0]);
        } else {
          setAccount(null);
          setBalance(null);
        }
      });

      eth.on("chainChanged", (newChainId: string) => {
        setChainId(newChainId);
        if (account) fetchBalance(account);
      });
    }
  }, []);

  const fetchBalance = async (address: string) => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const bal = await provider.getBalance(address);
      setBalance(ethers.formatEther(bal));
      
      const network = await provider.getNetwork();
      setChainId(network.chainId.toString(16));
    } catch (err: any) {
      console.error("Error fetching balance:", err);
    }
  };

  const connectWallet = async () => {
    setError(null);
    
    // Specifically look for BitForge first to avoid MetaMask conflict
    const providerObj = (window as any).bitforge || window.ethereum;

    if (!providerObj) {
      setError("No Web3 wallet detected. Please install BitForge Wallet Extension.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(providerObj as any);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        fetchBalance(accounts[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet.");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(37,99,235,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">BitForge dApp Test</h1>
          <p className="text-neutral-400">Connect to your wallet extension to view details.</p>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-900 text-red-400 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700">
              <p className="text-sm text-neutral-400 mb-1">Status</p>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="font-medium text-green-400">Connected</span>
                {isBitForge && <span className="ml-auto text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full border border-blue-800">BitForge Wallet</span>}
              </div>
            </div>

            <div className="bg-neutral-800 rounded-xl p-4 border border-neutral-700">
              <p className="text-sm text-neutral-400 mb-1">Address</p>
              <p className="font-mono text-sm break-all text-neutral-200">{account}</p>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-neutral-800 rounded-xl p-4 border border-neutral-700">
                <p className="text-sm text-neutral-400 mb-1">Balance</p>
                <p className="font-semibold text-lg">{balance ? Number(balance).toFixed(4) : "..."} ETH</p>
              </div>
              <div className="flex-1 bg-neutral-800 rounded-xl p-4 border border-neutral-700">
                <p className="text-sm text-neutral-400 mb-1">Chain ID</p>
                <p className="font-mono">{chainId ? `0x${chainId}` : "..."}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
