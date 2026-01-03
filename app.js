// ================================
// CONFIG
// ================================
const PRESALE_ADDRESS = "0x1D507F16c5983Ae8e2146731F32a6e23A9B5c7fE";
const USDT_ADDRESS    = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

// ABI MINIMAL PRESALE
const PRESALE_ABI = [
    "function buy(uint256 usdtAmount) external",
    "function stage() view returns (uint8)",
    "function currentPrice() view returns (uint256)"
];

// ABI MINIMAL USDT
const USDT_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)"
];

let provider;
let signer;
let presale;
let usdt;
let userAddress;

// ================================
// CONNECT WALLET
// ================================
async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask tidak ditemukan");
        return;
    }

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    userAddress = await signer.getAddress();

    presale = new ethers.Contract(PRESALE_ADDRESS, PRESALE_ABI, signer);
    usdt    = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);

    document.getElementById("wallet").innerText =
        "Wallet: " + userAddress;

    await loadPresaleInfo();
}

// ================================
// LOAD PRESALE INFO
// ================================
async function loadPresaleInfo() {
    const stage = await presale.stage();
    const price = await presale.currentPrice();

    document.getElementById("stage").innerText =
        "Stage: " + stage;

    document.getElementById("price").innerText =
        "Price: " + (price / 1e6) + " USDT / token";
}

// ================================
// BUY TOKEN
// ================================
async function buy() {
    try {
        const usdtInput = document.getElementById("usdtAmount").value;
        if (!usdtInput || usdtInput <= 0) {
            alert("Masukkan jumlah USDT");
            return;
        }

        const usdtAmount = ethers.utils.parseUnits(usdtInput, 6);

        document.getElementById("status").innerText =
            "Checking allowance...";

        const allowance = await usdt.allowance(
            userAddress,
            PRESALE_ADDRESS
        );

        if (allowance.lt(usdtAmount)) {
            document.getElementById("status").innerText =
                "Approve USDT...";

            const approveTx = await usdt.approve(
                PRESALE_ADDRESS,
                usdtAmount
            );
            await approveTx.wait();
        }

        document.getElementById("status").innerText =
            "Buying token...";

        const buyTx = await presale.buy(usdtAmount);
        await buyTx.wait();

        document.getElementById("status").innerText =
            "SUCCESS: Token berhasil dibeli";

        await loadPresaleInfo();

    } catch (err) {
        console.error(err);
        document.getElementById("status").innerText =
            "ERROR: Transaksi dibatalkan atau gagal";
    }
}
