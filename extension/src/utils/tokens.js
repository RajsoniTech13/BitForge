import { ethers } from "ethers";
import { getProvider } from "./crypto";

// Standard ERC-20 ABI — only the functions we need
const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)"
];

// Well-known ERC-20 tokens per network (chainId -> token list)
export const DEFAULT_TOKENS = {
    "1": [
        { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT", decimals: 6 },
        { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", decimals: 6 },
        { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", decimals: 18 },
    ],
    "11155111": [
        // Sepolia testnet — no standard tokens by default, users can add custom ones
    ],
    "137": [
        { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", symbol: "USDT", decimals: 6 },
        { address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", symbol: "USDC", decimals: 6 },
        { address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063", symbol: "DAI", decimals: 18 },
    ]
};

/**
 * Fetches the ERC-20 token balance for a given wallet address.
 * @param {string} tokenAddress - The contract address of the ERC-20 token.
 * @param {string} walletAddress - The wallet address to check balance for.
 * @param {string} chainId - The network chain ID.
 * @returns {Promise<{balance: string, symbol: string, decimals: number}>}
 */
export const getTokenBalance = async (tokenAddress, walletAddress, chainId) => {
    try {
        const provider = getProvider(chainId);
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const [balance, symbol, decimals] = await Promise.all([
            contract.balanceOf(walletAddress),
            contract.symbol(),
            contract.decimals()
        ]);
        return {
            balance: ethers.formatUnits(balance, decimals),
            symbol,
            decimals: Number(decimals)
        };
    } catch (e) {
        console.error("Failed to fetch token balance:", e);
        return { balance: "0.0", symbol: "???", decimals: 18 };
    }
};

/**
 * Sends an ERC-20 token transfer.
 * @param {ethers.Wallet} wallet - The unlocked ethers wallet (signer).
 * @param {string} tokenAddress - The contract address of the ERC-20 token.
 * @param {string} to - Recipient wallet address.
 * @param {string} amount - Human-readable amount to send (e.g. "10.5").
 * @param {number} decimals - Token decimals.
 * @param {string} chainId - Network chain ID.
 * @returns {Promise<string>} Transaction hash.
 */
export const sendToken = async (wallet, tokenAddress, to, amount, decimals, chainId) => {
    const provider = getProvider(chainId);
    const connectedWallet = wallet.connect(provider);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, connectedWallet);

    const parsedAmount = ethers.parseUnits(amount, decimals);
    const tx = await contract.transfer(to, parsedAmount);
    await tx.wait();
    return tx.hash;
};

/**
 * Fetches token metadata (name, symbol, decimals) for a given contract address.
 * Used when users manually add a custom token.
 * @param {string} tokenAddress - The contract address.
 * @param {string} chainId - The network chain ID.
 * @returns {Promise<{name: string, symbol: string, decimals: number}>}
 */
export const getTokenInfo = async (tokenAddress, chainId) => {
    const provider = getProvider(chainId);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals()
    ]);
    return { name, symbol, decimals: Number(decimals) };
};
