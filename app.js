console.log("Initializing SEZZ Presale Frontend...");

// ======================= CONFIG =======================
const RPC_URL = "https://polygon-rpc.com/"; // Ganti jika pakai RPC lain
const PRESALE_CONTRACT = "0xYourPresaleContractAddress"; // Ganti dengan contract SEZZ
const ABI = [
    "function stage() view returns (uint8)",
    "function currentPrice() view returns (uint256)",
    "function buy(uint256 usdtAmount) external",
    "function remainingToken(uint8) view returns (uint256)"
];

let provider;
let signer;
let contract;

// ======================= DOM ELEMENTS =======================
const stageEl = document.getElementById("stage");
const priceEl = document.getElementById("price");
const errorEl = document.getElementById("error");
const buyBtn = document.getElementById("buyBtn");
const usdtInput = document.getElementById("usdtAmount");

// ======================= INIT =======================
async function init() {
    console.log("Connecting to RPC...");

    try {
        provider = new ethers.JsonRpcProvider(RPC_URL);
        contract = new ethers.Contract(PRESALE_CONTRACT, ABI, provider);
        console.log("Contract loaded:", contract);

        await updateStageAndPrice();

        // Auto refresh every 10s
        setInterval(updateStageAndPrice, 10000);

    } catch (err) {
        console.error("Failed to load contract:", err);
        errorEl.textContent = "Error loading contract / RPC!";
    }
}

// ======================= UPDATE STAGE & PRICE =======================
async function updateStageAndPrice() {
    try {
        const stage = await contract.stage();
        const priceRaw = await contract.currentPrice();
        const price = Number(priceRaw);

        console.log("Current stage:", stage, "Price:", price);
        stageEl.textContent = stage;
        priceEl.textContent = price;
        errorEl.textContent = "";
    } catch (err) {
        console.error("Error fetching stage/price:", err);
        errorEl.textContent = "Failed to fetch stage or price!";
        stageEl.textContent = "-";
        priceEl.textContent = "-";
    }
}

// ======================= BUY SEZZ =======================
async function buySezz() {
    const amount = Number(usdtInput.value);
    if (!amount || amount <= 0) {
        alert("Enter valid USDT amount");
        return;
    }

    if (!window.ethereum) {
        alert("Wallet not detected! Install MetaMask.");
        return;
    }

    try {
        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        contract = new ethers.Contract(PRESALE_CONTRACT, ABI, signer);

        console.log("Wallet connected:", await signer.getAddress());
        console.log("Attempting to buy SEZZ with", amount, "USDT");

        const tx = await contract.buy(ethers.parseUnits(amount.toString(), 6));
        console.log("Transaction sent:", tx.hash);

        await tx.wait();
        console.log("Transaction confirmed!");
        alert("Purchase successful!");

        // Refresh stage & price after buy
        updateStageAndPrice();

    } catch (err) {
        console.error("Buy failed:", err);
        alert("Transaction failed! See console.");
    }
}

// ======================= EVENT LISTENERS =======================
buyBtn.addEventListener("click", buySezz);

// ======================= START =======================
init();
