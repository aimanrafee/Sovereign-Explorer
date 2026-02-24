/**
 * Sovereign Explorer Engine v2050
 * Specialized for ES-RFS Protocol - Secure Connection Patch
 */

const CONFIG = {
    // Alamat Node Ubuntu anda
    NODE_URL: 'http://192.168.8.102:3000/api/ledger',
    REFRESH_RATE: 5000,
    NETWORK_NAME: "SOVEREIGN_MAINNET_2050"
};

class SovereignExplorer {
    constructor() {
        this.ledgerData = [];
        this.isLive = false;
        this.init();
    }

    async init() {
        console.log("🚀 Initializing Sovereign Engine...");
        this.setupUI();
        await this.fetchData();
        setInterval(() => this.fetchData(), CONFIG.REFRESH_RATE);
    }

    setupUI() {
        const badge = document.getElementById('node-status-badge');
        if(badge) badge.innerText = "SYNCHRONIZING...";
    }

    async fetchData() {
        try {
            // Menggunakan timeout agar UI tidak 'hang' jika node offline
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000);

            const response = await fetch(CONFIG.NODE_URL, {
                signal: controller.signal,
                mode: 'cors', // Penting untuk isu CORS
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            clearTimeout(id);

            if (!response.ok) throw new Error('Network response was not ok');

            const rawData = await response.json();
            
            // Transformasi data jika ledger dalam bentuk objek (dari server.js)
            this.ledgerData = Array.isArray(rawData) ? rawData : Object.values(rawData);
            
            this.isLive = true;
            this.render();
            this.updateStats();
        } catch (error) {
            console.error("📡 Connection Error:", error.message);
            this.isLive = false;
            this.showError(error);
        }
    }

    updateStats() {
        const heightEl = document.getElementById('latest-block-height');
        const badge = document.getElementById('node-status-badge');

        if (heightEl) heightEl.innerText = `#${this.ledgerData.length.toString().padStart(6, '0')}`;
        if (badge) {
            badge.innerText = "NODE ONLINE";
            badge.style.background = "rgba(16, 185, 129, 0.2)";
            badge.style.color = "#10b981";
        }
    }

    render() {
        const container = document.getElementById('explorer-list');
        if (!container) return;
        
        container.innerHTML = ''; 

        // Paparkan 10 transaksi teratas sahaja untuk prestasi Ultimate
        const latestTx = [...this.ledgerData].reverse().slice(0, 10);

        latestTx.forEach(tx => {
            const txElement = this.createTxCard(tx);
            container.appendChild(txElement);
        });
    }

    createTxCard(tx) {
        const card = document.createElement('div');
        card.className = 'glass-panel p-5 rounded-2xl mb-4 tx-card-animate';
        
        // Handle Genesis/System Transactions
        const txType = tx.type || 'SECURED';
        const txAmount = tx.balance || tx.amount || 0;
        const txTo = tx.to || 'SYSTEM_RESERVE';
        const txHash = tx.hash || `PQC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <span class="text-[9px] font-black tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full">TX // ${txType}</span>
                <span class="text-[9px] text-gray-600 font-mono">${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="text-[11px] font-mono mb-4 text-white opacity-90 break-all">
                <span class="text-emerald-500/50">HASH:</span> ${txHash}
            </div>
            <div class="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                    <div class="text-[8px] uppercase text-gray-500 tracking-tighter">Liquid Asset</div>
                    <div class="text-sm font-bold text-white">${txAmount} <span class="text-[10px] text-emerald-500">VRT</span></div>
                </div>
                <div class="text-right">
                    <div class="text-[8px] uppercase text-gray-500 tracking-tighter">Destination Node</div>
                    <div class="text-[10px] font-mono text-emerald-400">${txTo.substring(0, 12)}...</div>
                </div>
            </div>
        `;
        return card;
    }

    showError(err) {
        const badge = document.getElementById('node-status-badge');
        if (badge) {
            badge.innerText = "SSL_BLOCK / OFFLINE";
            badge.style.background = "rgba(249, 115, 22, 0.2)";
            badge.style.color = "#f97316";
        }
        
        // Jika isu Mixed Content (HTTPS -> HTTP)
        if (window.location.protocol === 'https:' && CONFIG.NODE_URL.startsWith('http:')) {
            console.warn("🛡️ Security Alert: Mixed Content detected. Please enable 'Insecure Content' in site settings.");
        }
    }
}

// Power on
window.onload = () => new SovereignExplorer();
