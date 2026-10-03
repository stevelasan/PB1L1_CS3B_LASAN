class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.nonce = 0;
        this.hash = this.calculateHash();
    }

    // Calculate SHA-256 hash
    calculateHash() {
        return CryptoJS.SHA256(
            String(this.index) +
            String(this.timestamp) +
            String(this.data) +
            String(this.previousHash) +
            String(this.nonce)
        ).toString();
    }

    // Mine the block
    mineBlock(difficulty) {
        const target = "0".repeat(difficulty);

        console.log(`Mining Block #${this.index}...`);

        while (!this.hash.startsWith(target)) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log(
            `Block #${this.index} mined! Nonce: ${this.nonce}`
        );
    }
}



class Blockchain {
    constructor(difficulty = 3) {
        this.difficulty = difficulty;
        this.chain = [this.createGenesisBlock()];
    }

    // Create first block
    createGenesisBlock() {
        const genesis = new Block(
            0,
            new Date().toLocaleString(),
            "Genesis Block",
            "0"
        );

        genesis.mineBlock(this.difficulty);

        return genesis;
    }

    // Get latest block
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    // Add new block
    addBlock(data) {
        const previousBlock = this.getLatestBlock();

        const newBlock = new Block(
            this.chain.length,
            new Date().toLocaleString(),
            data,
            previousBlock.hash
        );

        // Mine block
        newBlock.mineBlock(this.difficulty);

        // Add to blockchain
        this.chain.push(newBlock);
    }

    // Check whether blockchain is valid
    isChainValid() {

        // Check every block
        for (let i = 1; i < this.chain.length; i++) {

            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            // Check current hash
            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            // Check previous hash
            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }

            // Check Proof-of-Work
            if (
                !currentBlock.hash.startsWith(
                    "0".repeat(this.difficulty)
                )
            ) {
                return false;
            }
        }

        return true;
    }

    // Reset blockchain
    reset() {
        this.chain = [this.createGenesisBlock()];
    }
}




const blockchain = new Blockchain(3);




const chainEl = document.getElementById("chain");
const statusEl = document.getElementById("status");
const addBlockBtn = document.getElementById("addBlockBtn");
const validateBtn = document.getElementById("validateBtn");
const resetBtn = document.getElementById("resetBtn");
const blockDataInput = document.getElementById("blockData");



function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}



function isBlockValid(index) {

    const block = blockchain.chain[index];

    // Genesis block
    if (index === 0) {
        return (
            block.hash === block.calculateHash()
        );
    }

    const previousBlock =
        blockchain.chain[index - 1];

    return (
        block.hash === block.calculateHash() &&
        block.previousHash === previousBlock.hash &&
        block.hash.startsWith(
            "0".repeat(blockchain.difficulty)
        )
    );
}




function renderChain() {

    chainEl.innerHTML = "";

    blockchain.chain.forEach((block, index) => {

        const valid = isBlockValid(index);

        const blockDiv = document.createElement("div");

        // FIXED VERSION OF YOUR ORIGINAL ERROR
        blockDiv.className =
            `block ${valid ? "valid" : "invalid"}`;

        blockDiv.innerHTML = `

            <div class="block-header">

                <h3>
                    🔗 Block #${block.index}
                </h3>

                <span class="badge ${valid ? "valid" : "invalid"}">
                    ${valid ? "✓ Valid" : "✗ Invalid"}
                </span>

            </div>


            <div class="field">

                <span class="label">
                    Timestamp
                </span>

                <div class="value">
                    ${escapeHTML(block.timestamp)}
                </div>

            </div>


            <div class="field">

                <span class="label">
                    Data
                </span>

                <div
                    class="value editable"
                    contenteditable="true"
                    data-index="${index}"
                    data-field="data"
                >
                    ${escapeHTML(block.data)}
                </div>

            </div>


            <div class="field">

                <span class="label">
                    Previous Hash
                </span>

                <div class="hash-row">

                    <div class="value hash">
                        ${escapeHTML(block.previousHash)}
                    </div>

                    <button
                        class="copy-btn"
                        data-copy="${escapeHTML(block.previousHash)}"
                    >
                        Copy
                    </button>

                </div>

            </div>


            <div class="field">

                <span class="label">
                    Nonce
                </span>

                <div class="value">
                    ${block.nonce}
                </div>

            </div>


            <div class="field">

                <span class="label">
                    Block Hash
                </span>

                <div class="hash-row">

                    <div class="value hash">
                        ${escapeHTML(block.hash)}
                    </div>

                    <button
                        class="copy-btn"
                        data-copy="${escapeHTML(block.hash)}"
                    >
                        Copy
                    </button>

                </div>

            </div>

        `;

        chainEl.appendChild(blockDiv);
    });


    
    document
        .querySelectorAll(".editable")
        .forEach(element => {

            element.addEventListener("input", event => {

                const index =
                    Number(event.target.dataset.index);

                blockchain.chain[index].data =
                    event.target.innerText.trim();

                /*
                 * IMPORTANT:
                 *
                 * We intentionally DO NOT recalculate
                 * the hash here.
                 *
                 * This demonstrates blockchain tampering.
                 */

                updateStatus();
                renderChain();
            });

        });


    
    document
        .querySelectorAll(".copy-btn")
        .forEach(button => {

            button.addEventListener("click", async () => {

                const text =
                    button.dataset.copy;

                try {

                    await navigator.clipboard.writeText(text);

                    const original =
                        button.textContent;

                    button.textContent = "Copied!";

                    setTimeout(() => {
                        button.textContent = original;
                    }, 1000);

                } catch (error) {

                    console.error(
                        "Copy failed:",
                        error
                    );

                }

            });

        });
}



function updateStatus() {

    const valid =
        blockchain.isChainValid();

    statusEl.textContent =
        valid
            ? "✓ Blockchain is valid"
            : "✗ Blockchain has been tampered with";

    statusEl.className =
        `status ${valid ? "valid" : "invalid"}`;
}




addBlockBtn.addEventListener("click", () => {

    const data =
        blockDataInput.value.trim();

    if (!data) {

        alert("Please enter block data.");

        blockDataInput.focus();

        return;
    }


    // Disable button while mining
    addBlockBtn.disabled = true;

    addBlockBtn.textContent =
        "⛏️ Mining...";


    // Small delay so the UI can update
    setTimeout(() => {

        blockchain.addBlock(data);

        blockDataInput.value = "";

        renderChain();

        updateStatus();

        addBlockBtn.disabled = false;

        addBlockBtn.textContent =
            "➕ Add Block";

    }, 50);

});




validateBtn.addEventListener("click", () => {

    updateStatus();

    renderChain();

});



if (resetBtn) {

    resetBtn.addEventListener("click", () => {

        const confirmReset =
            confirm(
                "Are you sure you want to reset the blockchain?"
            );

        if (!confirmReset) {
            return;
        }

        blockchain.reset();

        blockDataInput.value = "";

        renderChain();

        updateStatus();

    });

}



blockDataInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            addBlockBtn.click();

        }

    }
);




renderChain();
updateStatus();