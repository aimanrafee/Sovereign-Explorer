/**
 * Sovereign Explorer Engine v2050
 * Specialized for ES-RFS Protocol
 */

const CONFIG = {
    NODE_URL: 'http://192.168.8.102:3000/api/ledger',
    REFRESH_RATE: 5000 // 5 saat
};

class SovereignExplorer {
    constructor() {
        this.ledgerData = [];
        this.init();
    }

    async init() {
        console.log("Initializing Sovereign Engine...");
        await this.fetchData();
        setInterval(() => this.fetchData(), CONFIG.REFRESH_RATE);
    }

    async fetchData() {
        try {
            const response = await fetch(CONFIG.NODE_URL);
            this.ledgerData = await response.json();
            this.render();
            this.updateStats();
        } catch (error) {
            this.showError();
        }
    }

    updateStats() {
        document.getElementById('latest-block-height').innerText = `#${this.ledgerData.length}`;
        document.getElementById('node-status-badge').innerText = "NODE ONLINE";
    }

    render() {
        const container = document.getElementById('explorer-list');
        container.innerHTML = ''; // Clear for fresh render

        this.ledgerData.reverse().forEach(tx => {
            const txElement = this.createTxCard(tx);
            container.appendChild(txElement);
        });
    }

    createTxCard(tx) {
        const card = document.createElement('div');
        card.className = 'glass-panel p-5 rounded-2xl mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700';
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <span class="text-[9px] font-black tracking-widest px-3 py-1 bg-emerald-500/10 rounded-full">TX // SECURED</span>
                <span class="text-[9px] text-gray-600">${tx.timestamp || 'RECENT'}</span>
            </div>
            <div class="text-[11px] font-mono mb-4 text-white opacity-90 break-all">
                <span class="text-emerald-500/50">HASH:</span> ${tx.hash || 'GENESIS_HASH_8829...'}
            </div>
            <div class="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                <div>
                    <div class="text-[8px] uppercase text-gray-500 tracking-tighter">Amount</div>
                    <div class="text-sm font-bold text-white">${tx.amount} <span class="text-[10px] text-emerald-500">VRT</span></div>
                </div>
                <div class="text-right">
                    <div class="text-[8px] uppercase text-gray-500 tracking-tighter">Recipient</div>
                    <div class="text-[10px] font-mono text-emerald-400">${tx.to.substring(0, 12)}...</div>
                </div>
            </div>
        `;
        return card;
    }

    showError() {
        document.getElementById('node-status-badge').innerText = "LOCAL CACHE MODE";
        document.getElementById('node-status-badge').classList.replace('bg-emerald-500', 'bg-orange-500');
    }
}

// Power on
new SovereignExplorer();
