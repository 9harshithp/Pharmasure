const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MedicineBatchLedger", function () {
  async function deployLedger() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("MedicineBatchLedger");
    const ledger = await Factory.deploy();
    await ledger.waitForDeployment();
    return { ledger, owner, otherAccount };
  }

  it("sets the deployer as owner and starts with zero batches", async function () {
    const { ledger, owner } = await deployLedger();
    expect(await ledger.owner()).to.equal(owner.address);
    expect(await ledger.getTotalBatches()).to.equal(0n);
  });

  it("registers and verifies a pharmaceutical batch", async function () {
    const { ledger } = await deployLedger();
    const expiry = 1893456000n;

    await ledger.registerBatch("BATCH-001", "Amoxicillin 500mg", expiry, "PharmaCorp");

    expect(await ledger.getTotalBatches()).to.equal(1n);

    const [exists, name, expiryTimestamp, manufacturer, blockMinted, isRecalled] =
      await ledger.verifyBatch("BATCH-001");

    expect(exists).to.equal(true);
    expect(name).to.equal("Amoxicillin 500mg");
    expect(expiryTimestamp).to.equal(expiry);
    expect(manufacturer).to.equal("PharmaCorp");
    expect(blockMinted > 0n).to.equal(true);
    expect(isRecalled).to.equal(false);
  });

  it("returns exists=false for an unregistered batch", async function () {
    const { ledger } = await deployLedger();
    const [exists, name, expiryTimestamp, manufacturer, blockMinted, isRecalled] =
      await ledger.verifyBatch("UNKNOWN-BATCH");

    expect(exists).to.equal(false);
    expect(name).to.equal("");
    expect(expiryTimestamp).to.equal(0n);
    expect(manufacturer).to.equal("");
    expect(blockMinted).to.equal(0n);
    expect(isRecalled).to.equal(false);
  });

  it("rejects duplicate batch registration and unauthorized callers", async function () {
    const { ledger, otherAccount } = await deployLedger();
    await ledger.registerBatch("BATCH-002", "Metformin 850mg", 1893456000n, "BioLabs");

    let duplicateFailed = false;
    try {
      await ledger.registerBatch("BATCH-002", "Metformin 850mg", 1893456000n, "BioLabs");
    } catch (err) {
      duplicateFailed = err.message.includes("Batch already registered on-chain");
    }
    expect(duplicateFailed).to.equal(true);

    let unauthorizedFailed = false;
    try {
      await ledger
        .connect(otherAccount)
        .registerBatch("BATCH-003", "Ibuprofen 400mg", 1893456000n, "MediGen");
    } catch (err) {
      unauthorizedFailed = err.message.includes("Only authorized manufacturer/authority can execute");
    }
    expect(unauthorizedFailed).to.equal(true);
  });

  it("allows owner to flag a batch recall and rejects recalling missing batches", async function () {
    const { ledger, otherAccount } = await deployLedger();
    await ledger.registerBatch("BATCH-004", "Paracetamol 500mg", 1893456000n, "HealthFirst");

    await ledger.flagRecall("BATCH-004");
    const [, , , , , isRecalled] = await ledger.verifyBatch("BATCH-004");
    expect(isRecalled).to.equal(true);

    let missingFailed = false;
    try {
      await ledger.flagRecall("MISSING-BATCH");
    } catch (err) {
      missingFailed = err.message.includes("Batch not found");
    }
    expect(missingFailed).to.equal(true);

    let unauthorizedRecallFailed = false;
    try {
      await ledger.connect(otherAccount).flagRecall("BATCH-004");
    } catch (err) {
      unauthorizedRecallFailed = err.message.includes(
        "Only authorized manufacturer/authority can execute"
      );
    }
    expect(unauthorizedRecallFailed).to.equal(true);
  });
});

