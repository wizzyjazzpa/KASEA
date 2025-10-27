// createTokenWithWallet.js
const fs = require("fs");
const web3 = require("@solana/web3.js");
const splToken = require("@solana/spl-token");

const { Connection, Keypair, clusterApiUrl } = web3;
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = splToken;

const KEYPAIR_FILE = "wallet.json";

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

async function main() {
  // Connect to Solana Devnet
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
   //const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
  // Load wallet (payer)
  const payer = await loadOrCreateKeypair();
  console.log("💳 Owner Wallet Address:", payer.publicKey.toBase58());

  // Airdrop some SOL (for devnet testing)
  const airdropSig = await connection.requestAirdrop(payer.publicKey, 2e9); // 2 SOL
  await connection.confirmTransaction(airdropSig);
  console.log("✅ Airdropped 2 SOL");

  // Create token (the mint)
  const mint = await createMint(
    connection,
    payer,             // fee payer
    payer.publicKey,   // mint authority
    null,              // freeze authority (none)
    9                  // decimals (like 9 = 1 billion units = 1 token)
  );

  console.log("✅ Token Mint Created:", mint.toBase58());

  // Create a token account (wallet for this token)
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,             // fee payer
    mint,              // the token mint
    payer.publicKey    // owner of the token account
  );

  console.log("✅ Token Wallet Address:", tokenAccount.address.toBase58());

  // Mint some tokens into that wallet
  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer.publicKey,
    1000000000n // Mint 1000 tokens (decimals=9, so this is 1000 * 10^9)
  );

  console.log("✅ Minted 1000 tokens into wallet:", tokenAccount.address.toBase58());

  // Save all info
  fs.writeFileSync(
    "token.json",
    JSON.stringify(
      {
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

main().catch(console.error);
