// createTokenWithWallet.js
const fs = require("fs");
const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");
const { Keypair } = web3;
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = splToken;

const KEYPAIR_FILE = "wallet.json";

// === CONFIG ===
const NETWORK = process.env.SOLANA_NETWORK || "devnet";
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || null;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || null;

// RPC fallback list
const RPC_LIST = [
  HELIUS_API_KEY ? `https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}` : null,
  ALCHEMY_API_KEY ? `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` : null,
  web3.clusterApiUrl(NETWORK), // Solana official endpoint
].filter(Boolean);

const INITIAL_SUPPLY = 1000n * 1000000000n; // 1000 tokens

// --- Wallet Loader ---
async function loadOrCreateKeypair() {
  if (fs.existsSync(KEYPAIR_FILE)) {
    const secret = JSON.parse(fs.readFileSync(KEYPAIR_FILE, "utf8"));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  } else {
    const keypair = Keypair.generate();
    fs.writeFileSync(KEYPAIR_FILE, JSON.stringify(Array.from(keypair.secretKey)));
    console.log("🆕 New wallet created and saved to wallet.json");
    return keypair;
  }
}

// --- RPC Connection with Fallback ---
async function connectWithFallback() {
  for (let i = 0; i < RPC_LIST.length; i++) {
    const rpc = RPC_LIST[i];
    try {
      const connection = new web3.Connection(rpc, "confirmed");
      await connection.getEpochInfo(); // quick check
      console.log(`✅ Connected to RPC: ${rpc}`);
      return connection;
    } catch (err) {
      console.warn(`⚠️ RPC failed: ${rpc} -> ${err.message}`);
    }
  }
  throw new Error("❌ All RPC endpoints failed. Please check your internet or API keys.");
}

// --- Devnet Funding ---
async function ensureDevnetFunds(connection, wallet) {
  let balance = await connection.getBalance(wallet.publicKey);
  while (balance < 1 * web3.LAMPORTS_PER_SOL) {
    console.log("💧 Requesting Devnet airdrop...");
    const sig = await connection.requestAirdrop(wallet.publicKey, 2 * web3.LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, "confirmed");
    balance = await connection.getBalance(wallet.publicKey);
    console.log("✅ Devnet wallet funded. Balance:", balance / web3.LAMPORTS_PER_SOL, "SOL");
  }
}

// --- Mainnet Balance Check ---
async function checkMainnetFunds(connection, wallet) {
  const balance = await connection.getBalance(wallet.publicKey);
  console.log("💰 Wallet Balance:", balance / web3.LAMPORTS_PER_SOL, "SOL");
  if (balance < 0.05 * web3.LAMPORTS_PER_SOL) {
    throw new Error(`⚠️ Insufficient funds. Need ≥0.05 SOL, have ${balance / web3.LAMPORTS_PER_SOL}`);
  }
}

async function main() {
  const connection = await connectWithFallback();
  console.log(`🌐 Using network: ${NETWORK}`);

  const payer = await loadOrCreateKeypair();
  console.log("💳 Owner Wallet Address:", payer.publicKey.toBase58());

  if (NETWORK === "devnet") {
    await ensureDevnetFunds(connection, payer);
  } else {
    await checkMainnetFunds(connection, payer);
  }

  const mint = await createMint(connection, payer, payer.publicKey, null, 9);
  console.log("✅ Token Mint Created:", mint.toBase58());

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  console.log("✅ Token Wallet Address:", tokenAccount.address.toBase58());

  await mintTo(connection, payer, mint, tokenAccount.address, payer.publicKey, INITIAL_SUPPLY);
  console.log(`✅ Minted ${INITIAL_SUPPLY / 1000000000n} tokens`);

  fs.writeFileSync(
    "token.json",
    JSON.stringify(
      {
        network: NETWORK,
        mint: mint.toBase58(),
        ownerWallet: payer.publicKey.toBase58(),
        tokenWallet: tokenAccount.address.toBase58(),
      },
      null,
      2
    )
  );
  console.log("📄 Token + Wallet info saved to token.json");
}

main().catch((err) => console.error("❌ Error:", err.message));
