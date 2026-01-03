// ======================================================
// CONFIG
// ======================================================
const PRESALE_ADDRESS = "0x1D507F16c5983Ae8e2146731F32a6e23A9B5c7fE";
const USDT_ADDRESS    = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

// Polygon RPC (READ ONLY)
const RPC_URL = "https://polygon-rpc.com";

// ======================================================
// ABI
// ======================================================
const PRESALE_ABI = [
    "function stage() view returns (uint8)",
    "function currentPrice() view returns (uint256)",
    "function buy(uint256 usdtAmount)",
];

const USDT_ABI = [
    "function approve(address spender, uint256 amount) returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

// ======================================================
// GLOBAL VARIABLES
// ======================================================
let provider;
let signer;
let presale;        // write (wallet)
let presaleRead;    // read-only (no wallet)
let usdt;
let userAddress;

// ======================================================
// READ-ONLY PROVIDER (NO WALLET REQUIRED)
// ======================================================
const READ_PROVIDER = new ethers.providers.JsonRpcProvider(RPC_URL);

presaleRead = new ethers.Contract(
    PRESALE_ADDRESS,
    PRESALE_ABI,
    READ_PROVIDER
);

// ======================================================
// LOAD STAGE & PRICE (NO WALLET)
// ======================================================
async function loadPresaleInfo() {
    try {
        const stage = await presaleRead.stage();
        const price = await presaleRead.currentPrice();

        document.getElementById("stage").innerText =
            "Stage: " + stage;

        document.getElementById("price").innerText =
            "Price: " + (price / 1e6) + " USDT / token";
    } catch (err) {
        console.error(err);
        document.getElementById("stage").innerText =
            "Stage: unavailable";
        document.getElementById("price").innerText =
            "Price: unavailable";
    }
}

// ======================================================
// CONNECT WALLET (METAMASK)
// ======================================================
async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask not found");
        return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    userAddress = await signer.getAddress();

    presale = new ethers.Contract(
        PRESALE_ADDRESS,
        PRESALE_ABI,
        signer
    );

    usdt = new ethers.Contract(
        USDT_ADDRESS,
        USDT_ABI,
        signer
    );

    document.getElementById("wallet").innerText =
        "Wallet: " + userAddress;
}

// ======================================================
// BUY FUNCTION (REQUIRES WALLET)
// ======================================================
async function buyToken() {
    if (!signer) {
        alert("Please connect wallet first");
        return;
    }

    const input = document.getElementById("usdtAmount").value;
    if (!input || Number(input) <= 0) {
        alert("Enter USDT amount");
        return;
    }

    try {
        const decimals = await usdt.decimals();
        const amountUSDT = ethers.utils.parseUnits(input, decimals);

        const allowance = await usdt.allowance(
            userAddress,
            PRESALE_ADDRESS
        );

        if (allowance.lt(amountUSDT)) {
            const txApprove = await usdt.approve(
                PRESALE_ADDRESS,
                amountUSDT
            );
            await txApprove.wait();
        }

        const txBuy = await presale.buy(amountUSDT);
        await txBuy.wait();

        alert("Buy success");
        loadPresaleInfo();

    } catch (err) {
        console.error(err);
        alert("Transaction failed");
    }
}

// ======================================================
// AUTO LOAD DATA ON PAGE OPEN
// ======================================================
window.addEventListener("load", () => {
    loadPresaleInfo();
});
