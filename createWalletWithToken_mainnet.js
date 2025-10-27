const fs = require("fs");
const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");
const { Connection, Keypair, clusterApiUrl, LAMPORTS_PER_SOL } = web3;
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = splToken;

const KEYPAIR_FILE = "wallet.json";

// --- CONFIG ---
let NETWORK = process.env.SOLANA_NETWORK || "devnet";
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || null;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || null;

// CLI flags
const FORCE_MAINNET = process.argv.includes("--force-mainnet");
const FORCE_DEVNET = process.argv.includes("--devnet");

// RPC fallback list builder
function getRpcList(network) {
  return [
    HELIUS_API_KEY ? `https://rpc.helius.xyz/?api-key=${HELIUS_API_KEY}` : null,
    ALCHEMY_API_KEY ? `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}` : null,
    clusterApiUrl(network), // Solana official endpoint
  ].filter(Boolean);
}

async function getConnection(rpcList) {
  for (const url of rpcList) {
    try {
      const connection = new Connection(url, "confirmed");
      await connection.getEpochInfo(); // quick health check
      console.log(`✅ Connected to RPC: ${url}`);
      return connection;
    } catch (err) {
      console.warn(` RPC failed: ${url} — trying next...`);
    }
  }
  throw new Error("All RPCs failed. Check internet or API keys.");
}

async function loadOrCreateKeypair() {
  if (fs.existsSync(KEYPAIR_FILE)) {
    const secret = JSON.parse(fs.readFileSync(KEYPAIR_FILE, "utf8"));
    return Keypair.fromSecretKey(Uint8Array.from(secret));
  } else {
    const keypair = Keypair.generate();
    fs.writeFileSync(KEYPAIR_FILE, JSON.stringify(Array.from(keypair.secretKey)));
    console.log(" New wallet created and saved to wallet.json");
    return keypair;
  }
}

async function main() {
  // Apply flags
  if (FORCE_DEVNET) {
    NETWORK = "devnet";
    console.log(" Forcing Devnet (via --devnet flag)");
  }

  let rpcList = getRpcList(NETWORK);
  let connection = await getConnection(rpcList);

  // Load wallet
  const payer = await loadOrCreateKeypair();
  console.log(` Owner Wallet Address: ${payer.publicKey.toBase58()}`);

  // Get balance
  let balance = await connection.getBalance(payer.publicKey);

  if (NETWORK === "devnet") {
    console.log("⚡ Requesting airdrop of 2 SOL on Devnet...");
    const airdropSignature = await connection.requestAirdrop(
      payer.publicKey,
      1 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignature, "confirmed");
    console.log("✅ Airdrop completed!");
    balance = await connection.getBalance(payer.publicKey);
  } else if (NETWORK === "mainnet-beta" && balance === 0) {
    if (FORCE_MAINNET) {
      console.log("🚨 Force-mainnet enabled. Staying on mainnet even with 0 SOL.");
    } else {
      console.log("⚠️ No SOL on Mainnet. Switching to Devnet for testing...");
      NETWORK = "devnet";
      rpcList = getRpcList(NETWORK);
      connection = await getConnection(rpcList);

      console.log("⚡ Requesting airdrop of 2 SOL on Devnet...");
      const airdropSignature = await connection.requestAirdrop(
        payer.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(airdropSignature, "confirmed");
      console.log("✅ Airdrop completed!");
      balance = await connection.getBalance(payer.publicKey);
    }
  }

  console.log(`✅ Running on ${NETWORK}, balance: ${balance / LAMPORTS_PER_SOL} SOL`);

  // Create token (the mint)
  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    9
  );

  console.log("✅ Token Mint Created:", mint.toBase58());

  // Create a token account
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  console.log("✅ Token Wallet Address:", tokenAccount.address.toBase58());

  // Mint some tokens
  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer.publicKey,
    1000n * 1000000000n
  );

  console.log("✅ Minted 1000 tokens into wallet:", tokenAccount.address.toBase58());

  // Save info
  fs.writeFileSync(
    "token.json",
    JSON.stringify(
      {
        network: NETWORK,
        rpcUsed: connection.rpcEndpoint,
        mint: mint.toBase58(),
        ownerWallet: payer.publicKey.toBase58(),
        tokenWallet: tokenAccount.address.toBase58(),
        balance: balance / LAMPORTS_PER_SOL,
        forcedMainnet: FORCE_MAINNET,
        forcedDevnet: FORCE_DEVNET,
      },
      null,
      2
    )
  );

  console.log("📄 Token + Wallet info saved to token.json");
}

main().catch(console.error);
