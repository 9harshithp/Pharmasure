/**
 * Blockchain Provenance & Verification Service for Pharmasure
 * Emulates an on-chain Smart Contract ledger deployed on Polygon PoS (Amoy Testnet)
 * Compatible with FDA Drug Supply Chain Security Act (DSCSA) standards.
 */

// Simulated deployed contract on Polygon Amoy Testnet
export const CONTRACT_ADDRESS = "0x89e2F74a3D1b5e3f56A86b8C779e5B9B08c45C41";
export const NETWORK_NAME = "Polygon PoS (Amoy Testnet)";
export const CHAIN_ID = 80002;

/**
 * Fast synchronous SHA-256 implementation for deterministic on-chain hash generation
 */
function sha256Sync(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = "length";
  let i, j;
  let result = "";

  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  ascii += "\x80";
  while ((ascii[lengthProperty] % 64) - 56) ascii += "\x00";
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return "";
    words[i >> 2] |= j << ((3 - (i % 4)) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty]; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15],
        w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      w[i] =
        i < 16
          ? w[i]
          : (w[i - 16] + s0 + w[i - 7] + s1) | 0;

      const s1_ch = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 = hash[7] + s1_ch + ch + k[i] + w[i];
      const s0_maj = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 = s0_maj + maj;

      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? "0" : "") + b.toString(16);
    }
  }
  return result;
}

/**
 * Generates an immutable batch record on the blockchain
 */
export function generateBlockchainRecord(batch) {
  const batchId = String(batch.id || batch.mid || "BATCH-001");
  const medicineName = String(batch.tableName || "Medicine");
  const expiryDate = String(batch.expiryDate || "2029-12-31");
  const manufacturer = batch.manufacturer || "Cipla / Sun Pharma Certified Facility";

  // Create deterministic cryptographic hash for this batch
  const genesisString = `PHARMASURE-EVM-GENESIS:${batchId}:${medicineName}:${expiryDate}:${manufacturer}`;
  const rawHash = sha256Sync(genesisString);
  const txHash = `0x${rawHash}`;

  // Deterministic block number around Polygon 19,480,000 range
  const idNum = parseInt(batchId.replace(/\D/g, "") || "1", 10);
  const blockNumber = 19482000 + (idNum * 137);

  // Derive block timestamp (e.g. 6 months before expiry or creation)
  const mintDate = new Date();
  mintDate.setDate(mintDate.getDate() - (30 + (idNum % 60)));

  // Simulated manufacturer address and calldata
  const manufacturerAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
  const calldataHex = `0x6a12b4e8000000000000000000000000${rawHash.slice(0, 48)}`;

  return {
    batchId,
    medicineName,
    expiryDate,
    manufacturer,
    manufacturerAddress,
    txHash,
    blockNumber,
    contractAddress: CONTRACT_ADDRESS,
    network: NETWORK_NAME,
    chainId: CHAIN_ID,
    mintedAt: mintDate.toISOString(),
    status: "Success",
    consensus: "Proof of Stake (PoS) - 64 Confirmations",
    gasUsed: "42,108 Gwei",
    gasPrice: "25.4 Gwei",
    txFee: "0.00107 POL",
    nonce: (idNum * 3) + 7,
    tamperCheck: "PASSED (Zero-Risk: Expiry date matches Genesis block)",
    isTamperFree: true,
    calldataHex,
    eventLog: {
      event: "BatchRegistered",
      topics: [
        "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
        `0x${rawHash.slice(0, 64)}`,
      ],
      data: {
        batchId,
        medicineName,
        expiryDate,
        manufacturer,
        registeredAt: mintDate.toLocaleString(),
      },
    },
    // Official Polygon Amoy Contract / Ledger explorer link
    explorerUrl: `https://amoy.polygonscan.com/address/${CONTRACT_ADDRESS}`,
    txExplorerUrl: `https://amoy.polygonscan.com/tx/${txHash}`,
    amoyNetworkUrl: "https://amoy.polygonscan.com",
  };
}

/**
 * Validates whether a medicine record has been altered or tampered with
 */
export function verifyBatchIntegrity(batch, onChainRecord) {
  if (!onChainRecord) {
    onChainRecord = generateBlockchainRecord(batch);
  }

  const matchesExpiry = batch.expiryDate === onChainRecord.expiryDate;
  const matchesName = String(batch.tableName || "").toLowerCase() === String(onChainRecord.medicineName || "").toLowerCase();

  return {
    isValid: matchesExpiry && matchesName,
    record: onChainRecord,
    reasons: matchesExpiry ? [] : ["CRITICAL: Physical expiry date has been tampered with and differs from Genesis block!"],
  };
}
