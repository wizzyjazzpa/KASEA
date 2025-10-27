const fs = require("fs");
const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");
const { Connection, Keypair, clusterApiUrl, LAMPORTS_PER_SOL } = web3;
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = splToken;
require("dotenv").config();

const KEYPAIR_FILE = "wallet_token.json";
const OUTPUT_FILE = "token_main.json";

// --- CONFIG ---
let NETWORK = "mainnet-beta";
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || null;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || null;

// --- HELPER: Build RPC List ---
function getRpcList() {
  return [
    HELIUS_API_KEY ? `https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}` : null,
    ALCHEMY_API_KEY ? `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` : null,
    clusterApiUrl(NETWORK),
  ].filter(Boolean);
}

// --- HELPER: Reliable RPC Connection ---
async function getConnection(rpcList) {
  for (const url of rpcList) {
    const safeUrl = url.replace(/^wss:\/\//, "https://"); // force HTTPS if needed
    try {
      const connection = new Connection(safeUrl, "confirmed");
      await connection.getEpochInfo(); // quick health check
      console.log(`✅ Connected to RPC: ${safeUrl}`);
      return connection;
    } catch (err) {
      console.warn(`⚠️ Connection failed for ${safeUrl}. Trying next...`);
    }
  }
  throw new Error("❌ All RPCs failed — check internet or RPC keys.");
}

// --- WALLET HANDLING ---
async function loadOrCreateKeypair() {
  if (fs.existsSync(KEYPAIR_FILE)) {
    const secret = JSON.parse(fs.readFileSync(KEYPAIR_FILE, "utf8"));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  } else {
    const keypair = Keypair.generate();
    fs.writeFileSync(KEYPAIR_FILE, JSON.stringify(Array.from(keypair.secretKey)));
    console.log("🆕 New wallet created and saved to wallet_token.json");
    return keypair;
  }
}

async function main() {
  console.log("🌐 Running SPL Token Creator on Mainnet-Beta...");

  const rpcList = getRpcList();
  const connection = await getConnection(rpcList);

  // Load wallet
  const payer = await loadOrCreateKeypair();
  console.log(`💳 Owner Wallet Address: ${payer.publicKey.toBase58()}`);

  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`💰 Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  if (balance === 0) {
    console.log("⚠️ Wallet has 0 SOL. Please fund it before creating a token.");
    return;
  }

  // --- CREATE TOKEN ---
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    9 // decimals
  );
  console.log("✅ Token Mint Created:", mint.toBase58());

  // --- CREATE TOKEN ACCOUNT ---
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  console.log("✅ Token Wallet Address:", tokenAccount.address.toBase58());

  // --- MINT TOKENS ---
  const mintAmount = 1000n * 1000000000n; // 1000 tokens
  await mintTo(connection, payer, mint, tokenAccount.address, payer.publicKey, mintAmount);
  console.log(`✅ Minted ${mintAmount / 1000000000n} tokens into wallet.`);

  // --- SAVE TO FILE ---
  const tokenInfo = {
    network: NETWORK,
    rpcUsed: connection.rpcEndpoint,
    contractAddress: mint.toBase58(),
    ownerWallet: payer.publicKey.toBase58(),
    tokenWallet: tokenAccount.address.toBase58(),
    balance: balance / LAMPORTS_PER_SOL,
    mintedTokens: Number(mintAmount / 1000000000n),
    decimals: 9,
    explorerLink: `https://explorer.solana.com/address/${mint.toBase58()}?cluster=mainnet-beta`,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tokenInfo, null, 2));
  console.log(`📄 Token info saved to ${OUTPUT_FILE}`);

  console.log(`\n🚀 SPL Token Contract Address: ${mint.toBase58()}`);
  console.log(`🔗 View on Explorer: ${tokenInfo.explorerLink}`);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
});
