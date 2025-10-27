require("dotenv").config();
const fs = require("fs");
const { Metaplex, keypairIdentity, irysStorage } = require("@metaplex-foundation/js");
const { Connection, clusterApiUrl, Keypair, PublicKey } = require("@solana/web3.js");

// === Load wallet from PRIVATE_KEY_PATH (JSON array) ===
const secret = Uint8Array.from(JSON.parse(fs.readFileSync(process.env.PRIVATE_KEY_PATH, "utf8")));
const wallet = Keypair.fromSecretKey(secret);

// === Connect to Solana ===
const connection = new Connection(clusterApiUrl("mainnet-beta"));
const metaplex = Metaplex.make(connection)
  .use(keypairIdentity(wallet))
  .use(irysStorage());

// === Token mint address ===
const mintAddress = new PublicKey("GdxJGUzeaeJHYodEsekdDRWEPPHSeAZFtRP1X3mpWQew");

async function main() {
  try {
    console.log("✅ Connected to Solana mainnet-beta");
    console.log("🚀 Uploading metadata to Arweave via Irys...");

    // Upload metadata JSON to Arweave
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: "Kasea Coin",
      symbol: "KTN",
      description: "The Kasea coin is the next-gen meme token on Solana 🐱💎",
      image: "https://bafybeidq3u5qvbmtsg4m7c3b7fayowixvw6nwlqmc54lcbwspejz6nzhska.ipfs.nftstorage.link/",
      attributes: [
        { trait_type: "Category", value: "Meme Token" },
        { trait_type: "Blockchain", value: "Solana" },
      ],
      seller_fee_basis_points: 500,
      creators: [
        {
          address: wallet.publicKey.toBase58(),
          share: 100,
        },
      ],
    });

    console.log("✅ Metadata uploaded!");
    console.log("🌐 Metadata URI:", uri);

    try {
      console.log("🔍 Checking if metadata already exists...");
      const nft = await metaplex.nfts().findByMint({ mintAddress });
      console.log("✅ Metadata already exists for:", nft.name);

      // Update existing metadata
      const { response } = await metaplex.nfts().update({
        nftOrSft: nft,
        uri,
        name: "Kasea Coin",
        symbol: "KTN",
        sellerFeeBasisPoints: 500,
        creators: [
          { address: wallet.publicKey, share: 100 },
        ],
      });

      console.log("✅ Metadata successfully updated!");
      console.log("📦 Transaction Signature:", response.signature);
      console.log(`🔗 View on Solscan: https://solscan.io/tx/${response.signature}`);
    } catch (err) {
      if (err.name === "AccountNotFoundError") {
        console.log("⚙️ No metadata found — creating new metadata...");
        const { nft } = await metaplex.nfts().create({
          uri,
          name: "Kasea Coin",
          symbol: "KTN",
          sellerFeeBasisPoints: 500,
          creators: [
            { address: wallet.publicKey, share: 100 },
          ],
          mintAddress,       // attach to existing mint
          updateAuthority: wallet,
          tokenOwner: wallet.publicKey,
        });
        console.log("✅ Metadata created successfully!");
        console.log(`🔗 View on Solscan: https://solscan.io/address/${nft.mint.address.toBase58()}`);
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

main();
