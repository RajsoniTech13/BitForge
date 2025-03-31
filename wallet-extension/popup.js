document.addEventListener("DOMContentLoaded", function () {
    const createWalletBtn = document.getElementById("createWallet");
    const connectWalletBtn = document.getElementById("connectWallet");
    const sendTransactionBtn = document.getElementById("sendTransaction");
    const blockchainSelect = document.getElementById("blockchain");
    const walletIdInput = document.getElementById("walletId");
    const privateKeyInput = document.getElementById("privateKey");
    const sendToAddress = document.getElementById("sendToAddress");
    const sendAmount = document.getElementById("sendAmount");
    const walletAddress = document.getElementById("walletAddress");
    const walletBalance = document.getElementById("walletBalance");
    const privateKeyDisplay = document.getElementById("privateKeyDisplay");
    const statusMessage = document.getElementById("statusMessage");
    const walletListBody = document.querySelector("#walletList tbody");

    const API_BASE_URL = "http://localhost:3000";

    let myWallet;
    let connectedWallet;

    chrome.storage.local.get(["selectedBlockchain"], (result) => {
        if (result.selectedBlockchain) {
            blockchainSelect.value = result.selectedBlockchain;
            myWallet = new MyWallet(blockchainSelect.value);
            loadWallets();
            statusMessage.textContent = `Blockchain pre-selected: ${result.selectedBlockchain}`;
        } else {
            myWallet = new MyWallet(blockchainSelect.value);
            loadWallets();
        }
    });

    function loadWallets() {
        myWallet.loadWallets((wallets) => {
            walletListBody.innerHTML = "";
            (wallets || []).forEach(wallet => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${wallet.id}</td>
                    <td>${wallet.address}</td>
                    <td>${wallet.balance} ${myWallet.blockchain === "ethereum" ? "ETH" : "SOL "}</td>
                    <td>
                        <button class="select-btn" data-wallet-id="${wallet.id}">Select</button>
                        <button class="delete-btn" data-wallet-id="${wallet.id}">Delete</button>
                    </td>
                `;
                walletListBody.appendChild(row);
            });

            document.querySelectorAll(".select-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    walletIdInput.value = btn.getAttribute("data-wallet-id");
                });
            });

            document.querySelectorAll(".delete-btn").forEach(btn => {
                btn.addEventListener("click", async () => {
                    const walletId = parseInt(btn.getAttribute("data-wallet-id"));
                    const privateKey = prompt(`Enter the private key for wallet ${walletId} to confirm deletion:`);
                    
                    if (privateKey === null) return;
                    if (!privateKey) {
                        alert("Private key is required!");
                        return;
                    }

                    const success = await myWallet.deleteWallet(walletId, privateKey);
                    if (success) {
                        alert(`Wallet ${walletId} has been permanently removed.`);
                        loadWallets();
                        if (connectedWallet && connectedWallet.id === walletId) {
                            connectedWallet = null;
                            updateWalletDetails();
                        }
                    }
                });
            });
        });
    }

    function updateWalletDetails() {
        if (connectedWallet) {
            walletAddress.textContent = `Wallet Address: ${connectedWallet.address}`;
            walletBalance.textContent = `Balance: ${connectedWallet.balance} ${myWallet.blockchain === "ethereum" ? "ETH" : "SOL"}`;
        } else {
            walletAddress.textContent = "Wallet Address: Not connected";
            walletBalance.textContent = "Balance: Not available";
        }
    }

    blockchainSelect.addEventListener("change", () => {
        myWallet = new MyWallet(blockchainSelect.value);
        connectedWallet = null;
        loadWallets();
        updateWalletDetails();
        privateKeyInput.value = ""; // Clear on blockchain change
    });

    createWalletBtn.addEventListener("click", async function () {
        const blockchain = blockchainSelect.value;
        const endpoint = `/create-${blockchain}-wallet`;
        try {
            const response = await fetch(API_BASE_URL + endpoint);
            const data = await response.json();
            if (response.ok) {
                const wallet = myWallet.addWallet(data);
                await navigator.clipboard.writeText(wallet.privateKey);
                statusMessage.textContent = "Wallet created successfully! Private key copied to clipboard.";
                privateKeyDisplay.textContent = `Private Key: ${wallet.privateKey} (Already copied!)`;
                loadWallets();
                setTimeout(() => {
                    privateKeyDisplay.textContent = "Private Key: Hidden (hope you saved it!)";
                }, 10000);
            } else {
                statusMessage.textContent = "Error: " + (data.error || "Unknown server error");
            }
        } catch (error) {
            console.error("Create wallet error:", error);
            statusMessage.textContent = `Error: Could not create wallet - ${error.message}`;
        }
    });

    connectWalletBtn.addEventListener("click", async function () {
        const blockchain = blockchainSelect.value;
        const walletId = parseInt(walletIdInput.value);
        const privateKey = privateKeyInput.value.trim();

        if (!walletId || !privateKey) {
            statusMessage.textContent = "Error: Enter Wallet ID and Private Key.";
            return;
        }

        connectedWallet = await myWallet.connectWallet(walletId, privateKey);
        if (connectedWallet) {
            statusMessage.textContent = "Wallet connected!";
            updateWalletDetails();
            sendTransactionBtn.style.display = "block";
            privateKeyInput.value = ""; // Clear private key after connection
        } else {
            statusMessage.textContent = "Error: Invalid Wallet ID or Private Key.";
            sendTransactionBtn.style.display = "none";
        }
    });

    sendTransactionBtn.addEventListener("click", async function () {
        const toAddress = sendToAddress.value.trim();
        const amount = parseFloat(sendAmount.value);
        const privateKey = prompt("Enter your private key to confirm transaction:");

        if (!toAddress || !amount || amount <= 0 || !privateKey) {
            statusMessage.textContent = "Error: Enter valid recipient address, amount, and private key.";
            return;
        }

        if (!connectedWallet) {
            statusMessage.textContent = "Error: No wallet connected.";
            return;
        }

        const success = await myWallet.sendTransaction(connectedWallet.id, toAddress, amount, privateKey);
        if (success) {
            statusMessage.textContent = `Successfully sent ${amount} ${myWallet.blockchain === "ethereum" ? "ETH" : "SOL"} to ${toAddress}`;
            connectedWallet.balance -= amount;
            loadWallets();
            updateWalletDetails();
            sendToAddress.value = ""; // Clear recipient address
            sendAmount.value = ""; // Clear amount
        } else {
            statusMessage.textContent = "Transaction failed.";
        }
    });
});