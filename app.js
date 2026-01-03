// CONFIG
const PRESALE_ADDRESS = "0x1D507F16c5983Ae8e2146731F32a6e23A9B5c7fE";
const RPC_URL = "https://rpc.ankr.com/polygon";

const PRESALE_ABI = [
    "function stage() view returns (uint8)",
    "function currentPrice() view returns (uint256)"
];

// PROVIDER READ-ONLY
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const presaleRead = new ethers.Contract(PRESALE_ADDRESS, PRESALE_ABI, provider);

// LOAD DATA
async function loadPresale() {
    try {
        const stage = await presaleRead.stage();
        const price = await presaleRead.currentPrice();

        document.getElementById("stage").innerText = stage;
        document.getElementById("price").innerText = (price / 1e6) + " USDT / SEZZ";

    } catch (err) {
        console.error(err);
        document.getElementById("stage").innerText = "Error";
        document.getElementById("price").innerText = "Error";
    }
}

// LOAD ON PAGE OPEN
window.addEventListener("load", loadPresale);
