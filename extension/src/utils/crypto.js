import { ethers } from "ethers";

// Default Networks
export const NETWORKS = {
    "1": { name: "Ethereum Mainnet", rpc: "https://cloudflare-eth.com", chainId: "1", symbol: "ETH", explorer: "https://etherscan.io" },
    "11155111": { name: "Sepolia Testnet", rpc: "https://rpc.sepolia.org", chainId: "11155111", symbol: "SEP ETH", explorer: "https://sepolia.etherscan.io" },
    "137": { name: "Polygon Mainnet", rpc: "https://polygon-rpc.com", chainId: "137", symbol: "POL", explorer: "https://polygonscan.com" },
};

export const generateSeedPhrase = () => {
    const wallet = ethers.Wallet.createRandom();
    return wallet.mnemonic.phrase;
};

export const createWalletFromMnemonic = async (mnemonic, password) => {
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    // Encrypt the wallet (this is CPU intensive and takes a few seconds)
    const encryptedJson = await wallet.encrypt(password);
    return { address: wallet.address, encryptedJson };
};

export const decryptWallet = async (encryptedJson, password) => {
    const wallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, password);
    return wallet;
};

export const getProvider = (chainId) => {
    const network = NETWORKS[chainId] || NETWORKS["11155111"];
    return new ethers.JsonRpcProvider(network.rpc);
};

export const getBalance = async (address, chainId) => {
    try {
        const provider = getProvider(chainId);
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    } catch (e) {
        console.error("Failed to fetch balance:", e);
        return "0.0";
    }
};

export const sendTransaction = async (wallet, to, amount, chainId) => {
    const provider = getProvider(chainId);
    const connectedWallet = wallet.connect(provider);
    
    const tx = {
        to: to,
        value: ethers.parseEther(amount)
    };
    
    const response = await connectedWallet.sendTransaction(tx);
    await response.wait();
    return response.hash;
};
