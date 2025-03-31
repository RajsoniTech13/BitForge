class MyWallet {
    constructor(blockchain) {
        this.blockchain = blockchain;
        this.wallets = [];
        this.loadWallets((wallets) => {
            this.wallets = wallets || [];
        });
    }

    addWallet(wallet) {
        const walletData = {
            id: wallet.id,
            address: wallet.address,
            balance: this.blockchain === "ethereum" ? 0.5 : 5
        };
        this.wallets.push(walletData);
        this.saveWallets();
        alert(`Wallet created with gift from BitForge Wallet: ${walletData.balance} ${this.blockchain === "ethereum" ? "ETH" : "SOL"}`);
        return { ...wallet, balance: walletData.balance };
    }

    saveWallets() {
        chrome.storage.local.set({ [`${this.blockchain}_wallets`]: this.wallets }, () => {
            console.log(`Saved ${this.blockchain} wallets:`, this.wallets);
        });
    }

    loadWallets(callback) {
        chrome.storage.local.get([`${this.blockchain}_wallets`], (result) => {
            const wallets = result[`${this.blockchain}_wallets`];
            console.log(`Loaded ${this.blockchain} wallets:`, wallets);
            callback(wallets);
        });
    }

    async connectWallet(walletId, privateKey) {
        const wallet = this.wallets.find(w => w.id === walletId);
        if (!wallet) {
            alert("Wallet Not Found!");
            return null;
        }

        const endpoint = this.blockchain === "ethereum" ? "/connect-ethereum-wallet" : "/connect-solana-wallet";
        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ privateKey })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            if (data.address !== wallet.address) throw new Error("Private key does not match wallet address");
            return { id: wallet.id, address: wallet.address, privateKey, balance: wallet.balance };
        } catch (error) {
            alert(`Connection failed: ${error.message}`);
            return null;
        }
    }

    async deleteWallet(walletId, privateKey) {
        const wallet = this.wallets.find(w => w.id === walletId);
        if (!wallet) {
            alert("Wallet Not Found!");
            return false;
        }

        const endpoint = this.blockchain === "ethereum" ? "/connect-ethereum-wallet" : "/connect-solana-wallet";
        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ privateKey })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            if (data.address !== wallet.address) throw new Error("Private key does not match wallet address");

            this.wallets = this.wallets.filter(w => w.id !== walletId);
            this.saveWallets();
            return true;
        } catch (error) {
            alert(`Deletion failed: ${error.message}`);
            return false;
        }
    }

    async sendTransaction(fromWalletId, toAddress, amount, privateKey) {
        const fromWallet = this.wallets.find(w => w.id === fromWalletId);
        if (!fromWallet) {
            alert("Sender wallet not found!");
            return false;
        }

        // Verify private key
        const endpoint = this.blockchain === "ethereum" ? "/connect-ethereum-wallet" : "/connect-solana-wallet";
        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ privateKey })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            if (data.address !== fromWallet.address) throw new Error("Private key does not match sender wallet");
        } catch (error) {
            alert(`Transaction failed: ${error.message}`);
            return false;
        }

        // Check self-transaction
        if (fromWallet.address === toAddress) {
            alert("Cannot send to the same wallet!");
            return false;
        }

        // Check balance
        if (fromWallet.balance <= 0) {
            alert("Zero balance - cannot send transaction!");
            return false;
        }
        if (fromWallet.balance < amount) {
            alert("Insufficient balance!");
            return false;
        }

        const toWallet = this.wallets.find(w => w.address === toAddress);
        
        fromWallet.balance -= amount;
        if (toWallet) {
            toWallet.balance += amount;
        }
        
        this.saveWallets();
        return true;
    }
}