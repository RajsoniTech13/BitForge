class BitForgeProvider {
  constructor() {
      this.isBitForge = true;
      this.isMetaMask = false; // Set to false to distinguish from MetaMask
      this.chainId = null;
      this.networkVersion = null;
      this.selectedAddress = null;

      this.callbacks = new Map();
      this.nextId = 0;

      window.addEventListener("message", (event) => {
          if (event.source !== window || !event.data || event.data.target !== "bitforge-injected") return;

          const { id, error, result, method, params } = event.data;

          if (id !== undefined && this.callbacks.has(id)) {
              const { resolve, reject } = this.callbacks.get(id);
              this.callbacks.delete(id);

              if (error) reject(new Error(error));
              else resolve(result);
          } else if (method === "accountsChanged") {
              this.selectedAddress = params[0];
              this._emit("accountsChanged", params);
          } else if (method === "chainChanged") {
              this.chainId = params.chainId;
              this._emit("chainChanged", this.chainId);
          }
      });
  }

  request(args) {
      return new Promise((resolve, reject) => {
          const id = this.nextId++;
          this.callbacks.set(id, { resolve, reject });

          window.postMessage({
              target: "bitforge-contentscript",
              id,
              method: args.method,
              params: args.params || []
          }, "*");
      });
  }

  on(event, handler) {
      if (!this._events) this._events = {};
      if (!this._events[event]) this._events[event] = [];
      this._events[event].push(handler);
  }

  removeListener(event, handler) {
      if (!this._events || !this._events[event]) return;
      this._events[event] = this._events[event].filter(h => h !== handler);
  }

  _emit(event, ...args) {
      if (this._events && this._events[event]) {
          this._events[event].forEach(handler => handler(...args));
      }
  }
}

const provider = new BitForgeProvider();

// EIP-6963: Multi-Injected Provider Discovery
function announceProvider() {
  const info = {
    uuid: "bitforge-wallet-unique-id",
    name: "BitForge Wallet",
    icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzAwN2FjYyIgZD0iTTEzIDEwVjNMNCAxNGg3djdsOS0xMWgtN3oiLz48L3N2Zz4=",
    rdns: "com.bitforge.wallet",
  };
  window.dispatchEvent(
    new CustomEvent("eip6963:announceProvider", {
      detail: Object.freeze({ info, provider }),
    })
  );
}

window.addEventListener("eip6963:requestProvider", announceProvider);
announceProvider();

// Assertive injection to ensure BitForge is available
// We store existing providers to avoid breaking other wallets
if (window.ethereum) {
    if (!window.ethereum.providers) {
        const existing = window.ethereum;
        window.ethereum = provider;
        window.ethereum.providers = [provider, existing];
    } else {
        window.ethereum.providers.unshift(provider);
    }
} else {
    window.ethereum = provider;
}

window.bitforge = provider;
window.dispatchEvent(new Event("ethereum#initialized"));
