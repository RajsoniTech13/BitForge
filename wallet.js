async function createWallet(blockchain) {
    if (blockchain === "ethereum") {
        const web3 = new Web3();
        const account = web3.eth.accounts.create();
        return {
            privateKey: account.privateKey,
            address: account.address
        };
    } else if (blockchain === "solana") {
        const keypair = solanaWeb3.Keypair.generate();
        return {
            privateKey: Buffer.from(keypair.secretKey).toString("hex"),
            address: keypair.publicKey.toBase58()
        };
    }
}

async function connectWallet(blockchain, privateKey) {
    if (blockchain === "ethereum") {
        const web3 = new Web3();
        try {
            const account = web3.eth.accounts.privateKeyToAccount(privateKey);
            return {
                privateKey: privateKey,
                address: account.address
            };
        } catch (error) {
            console.error("Invalid Ethereum Private Key");
        }
    } else if (blockchain === "solana") {
        try {
            const secretKeyArray = Uint8Array.from(privateKey.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
            const keypair = solanaWeb3.Keypair.fromSecretKey(secretKeyArray);
            return {
                privateKey: privateKey,
                address: keypair.publicKey.toBase58()
            };
        } catch (error) {
            console.error("Invalid Solana Private Key");
        }
    }
    return null;
}
