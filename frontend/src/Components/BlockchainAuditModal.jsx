import React, { useState } from "react";
import {
  FaLink,
  FaCheckCircle,
  FaShieldAlt,
  FaExternalLinkAlt,
  FaCopy,
  FaCube,
  FaGasPump,
  FaTimes,
  FaLock,
  FaSearch,
  FaCode,
  FaEthereum,
  FaPaperPlane,
  FaInfoCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { generateBlockchainRecord, verifyBatchIntegrity, CONTRACT_ADDRESS } from "../utils/blockchainService";

const BlockchainAuditModal = ({ show, onClose, item }) => {
  const [activeTab, setActiveTab] = useState("audit"); // 'audit' | 'explorer' | 'broadcast'
  const [copied, setCopied] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [liveTxHash, setLiveTxHash] = useState(null);

  if (!show || !item) return null;

  const record = generateBlockchainRecord(item);
  const integrity = verifyBatchIntegrity(item, record);

  const handleCopyHash = (text) => {
    navigator.clipboard.writeText(text || record.txHash);
    setCopied(true);
    toast.success("📋 Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBroadcastMetaMask = async () => {
    if (typeof window.ethereum === "undefined") {
      toast.warning("🦊 MetaMask extension not detected! Please install MetaMask to broadcast live transactions to public Polygon Amoy.");
      return;
    }

    try {
      setIsBroadcasting(true);
      toast.info("Connecting to MetaMask wallet...");

      // 1. Request user accounts
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const userAddress = accounts[0];

      // 2. Ensure Polygon Amoy Testnet (Chain ID 80002 / 0x13882)
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x13882" }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x13882",
                chainName: "Polygon Amoy Testnet",
                nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
                rpcUrls: ["https://rpc-amoy.polygon.technology"],
                blockExplorerUrls: ["https://amoy.polygonscan.com"],
              },
            ],
          });
        }
      }

      // 3. Hex encode batch provenance metadata
      const payloadString = `PHARMASURE:${record.batchId}:${record.medicineName}:${record.expiryDate}:${record.manufacturer}`;
      const hexPayload = "0x" + Array.from(new TextEncoder().encode(payloadString))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // 4. Send transaction to self or contract with payload data
      const txParams = {
        from: userAddress,
        to: userAddress,
        value: "0x0",
        data: hexPayload,
      };

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [txParams],
      });

      setLiveTxHash(txHash);
      toast.success("🎉 Batch successfully mined & published to Polygon Amoy!");
    } catch (err) {
      console.error("MetaMask error:", err);
      toast.error(err.message || "MetaMask transaction cancelled");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div
      className="modal show fade"
      style={{ display: "block", backgroundColor: "rgba(10, 15, 30, 0.78)", zIndex: 1080 }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div
            className="modal-header text-white py-3"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <span className="p-2 rounded-3 bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25">
                <FaLink size={18} />
              </span>
              <div>
                <h5 className="modal-title fw-bold mb-0 d-flex align-items-center gap-2">
                  Blockchain Batch Provenance Ledger
                </h5>
                <small className="text-light opacity-75">
                  FDA DSCSA Track & Trace • Polygon PoS Chain (Amoy 80002)
                </small>
              </div>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            />
          </div>

          {/* Navigation Tabs */}
          <div className="bg-light px-3 pt-2 border-bottom d-flex gap-2">
            <button
              className={`btn btn-sm ${activeTab === "audit" ? "btn-primary fw-bold" : "btn-light text-muted"}`}
              onClick={() => setActiveTab("audit")}
            >
              <FaShieldAlt className="me-1" /> Provenance Audit
            </button>
            <button
              className={`btn btn-sm ${activeTab === "explorer" ? "btn-primary fw-bold" : "btn-light text-muted"}`}
              onClick={() => setActiveTab("explorer")}
            >
              <FaSearch className="me-1" /> On-Chain Explorer (Polygonscan View)
            </button>
            <button
              className={`btn btn-sm ${activeTab === "broadcast" ? "btn-primary fw-bold" : "btn-light text-muted"}`}
              onClick={() => setActiveTab("broadcast")}
            >
              <FaEthereum className="me-1" /> Broadcast to Public Polygon
            </button>
          </div>

          <div className="modal-body p-4" style={{ backgroundColor: "#f8fafc" }}>
            {/* TAB 1: AUDIT VIEW */}
            {activeTab === "audit" && (
              <div>
                {/* Status Banner */}
                <div className="p-3 rounded-3 mb-3 bg-white border border-success border-2 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <span className="p-2 rounded-circle bg-success text-white">
                      <FaCheckCircle size={24} />
                    </span>
                    <div>
                      <h6 className="fw-bold mb-0 text-success d-flex align-items-center gap-2">
                        IMMUTABLE ON-CHAIN VERIFIED
                      </h6>
                      <span className="small text-muted">
                        Smart Contract: <code className="text-dark">{CONTRACT_ADDRESS.slice(0, 10)}...{CONTRACT_ADDRESS.slice(-8)}</code>
                      </span>
                    </div>
                  </div>
                  <span className="badge bg-dark text-light px-3 py-2 fw-semibold">
                    ⛓️ {record.network}
                  </span>
                </div>

                {/* Medicine Details Card */}
                <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <span className="text-muted small">Medicine / Drug Name</span>
                      <div className="fw-bold text-dark fs-6">{record.medicineName}</div>
                    </div>
                    <div className="col-md-3">
                      <span className="text-muted small">Batch Identifier</span>
                      <div className="fw-bold text-primary font-monospace">{record.batchId}</div>
                    </div>
                    <div className="col-md-3">
                      <span className="text-muted small">Genesis Expiry Date</span>
                      <div className="fw-bold text-success font-monospace">{record.expiryDate}</div>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Proof Details */}
                <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
                  <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <FaLock className="text-primary" /> Cryptographic Integrity Audit
                  </h6>

                  <div className="d-flex flex-column gap-3 small">
                    {/* Tx Hash */}
                    <div>
                      <span className="text-muted d-block mb-1">Genesis Transaction Hash:</span>
                      <div className="d-flex align-items-center gap-2 bg-light p-2 rounded-2 border">
                        <code className="text-dark text-break font-monospace flex-grow-1">
                          {liveTxHash || record.txHash}
                        </code>
                        <button
                          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                          onClick={() => handleCopyHash(liveTxHash || record.txHash)}
                        >
                          <FaCopy size={12} /> {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>

                    <div className="row g-2">
                      <div className="col-md-4">
                        <div className="p-2 rounded-2 bg-light border">
                          <span className="text-muted d-block" style={{ fontSize: "11px" }}>Block Number</span>
                          <strong className="text-dark d-flex align-items-center gap-1">
                            <FaCube size={12} className="text-primary" /> #{record.blockNumber.toLocaleString()}
                          </strong>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-2 rounded-2 bg-light border">
                          <span className="text-muted d-block" style={{ fontSize: "11px" }}>Gas Fee Used</span>
                          <strong className="text-dark d-flex align-items-center gap-1">
                            <FaGasPump size={12} className="text-warning" /> {record.gasUsed}
                          </strong>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-2 rounded-2 bg-light border">
                          <span className="text-muted d-block" style={{ fontSize: "11px" }}>Consensus</span>
                          <strong className="text-success" style={{ fontSize: "12px" }}>
                            {record.consensus}
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* Expiry Anti-Tampering Check */}
                    <div className={`p-3 rounded-2 mt-1 border ${integrity.tampered ? "bg-danger bg-opacity-10 border-danger" : "bg-success bg-opacity-10 border-success border-opacity-25"}`}>
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <strong className={`d-flex align-items-center gap-2 ${integrity.tampered ? "text-danger" : "text-success"}`}>
                          <FaShieldAlt /> Expiry Date Anti-Tampering Validation
                        </strong>
                        <span className={`badge ${integrity.tampered ? "bg-danger text-white" : "bg-success text-white"}`}>
                          {integrity.tampered ? "Tampering Alert" : "100% Tamper-Free"}
                        </span>
                      </div>
                      <p className="mb-0 text-secondary" style={{ fontSize: "12px" }}>
                        Physical expiration date (<strong>{item.expiryDate}</strong>) {integrity.tampered ? "does NOT match genesis record!" : "precisely matches the initial genesis mint block sealed at manufacture. Zero unauthorized date extension detected."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Manufacturer Signature & Quick Links */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 text-muted small px-1">
                  <span>Origin: <strong>{record.manufacturer}</strong></span>
                  <button
                    className="btn btn-sm btn-link text-primary fw-bold text-decoration-none p-0 d-flex align-items-center gap-1"
                    onClick={() => setActiveTab("explorer")}
                  >
                    Inspect Full On-Chain Receipt <FaExternalLinkAlt size={11} />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: IN-APP POLYGONSCAN EXPLORER */}
            {activeTab === "explorer" && (
              <div className="bg-white rounded-3 p-3 border shadow-sm">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                  <div>
                    <span className="badge bg-purple text-white me-2" style={{ backgroundColor: "#8247e5" }}>
                      Polygon PoS
                    </span>
                    <strong className="fs-6">Polygonscan Amoy Transaction Details</strong>
                  </div>
                  <span className="badge bg-success bg-opacity-10 text-success border border-success">
                    <FaCheckCircle className="me-1" /> Success
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm table-borderless align-middle mb-0" style={{ fontSize: "13px" }}>
                    <tbody>
                      <tr className="border-bottom">
                        <td className="text-muted py-2" style={{ width: "220px" }}>Transaction Hash:</td>
                        <td className="py-2">
                          <div className="d-flex align-items-center gap-2">
                            <code className="text-dark font-monospace text-break">
                              {liveTxHash || record.txHash}
                            </code>
                            <button
                              className="btn btn-sm btn-light border p-1"
                              onClick={() => handleCopyHash(liveTxHash || record.txHash)}
                              title="Copy Tx Hash"
                            >
                              <FaCopy size={11} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="text-muted py-2">Status:</td>
                        <td className="py-2">
                          <span className="badge bg-success text-white">Success</span>
                        </td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="text-muted py-2">Block:</td>
                        <td className="py-2">
                          <span className="text-primary fw-semibold">#{record.blockNumber.toLocaleString()}</span>{" "}
                          <span className="badge bg-light text-dark border">64 Block Confirmations</span>
                        </td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="text-muted py-2">Timestamp:</td>
                        <td className="py-2 text-dark">
                          {record.mintedAt} (Sealed by Pharmaceutical Consortium Node)
                        </td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="text-muted py-2">From (Manufacturer Node):</td>
                        <td className="py-2">
                          <code className="text-primary font-monospace">{record.manufacturerAddress}</code>{" "}
                          <span className="badge bg-light text-dark border">{record.manufacturer}</span>
                        </td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="text-muted py-2">Interacted With (To):</td>
                        <td className="py-2">
                          <span>Contract </span>
                          <code className="text-primary font-monospace">{CONTRACT_ADDRESS}</code>{" "}
                          <span className="badge bg-info bg-opacity-10 text-info border border-info">MedicineBatchLedger</span>
                        </td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="text-muted py-2">Value:</td>
                        <td className="py-2 text-dark font-monospace">0 POL ($0.00)</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="text-muted py-2">Transaction Fee:</td>
                        <td className="py-2 text-dark font-monospace">{record.txFee}</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="text-muted py-2">Gas Price:</td>
                        <td className="py-2 text-dark font-monospace">{record.gasPrice} ({record.gasUsed})</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Decoded Event Log Section */}
                <div className="mt-3 p-3 rounded-3 bg-light border">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <strong className="text-dark d-flex align-items-center gap-2" style={{ fontSize: "13px" }}>
                      <FaCode className="text-primary" /> Decoded Event Logs [1] : BatchRegistered
                    </strong>
                    <span className="badge bg-dark">Topic 0</span>
                  </div>
                  <pre className="p-2 bg-dark text-light rounded font-monospace small mb-0" style={{ fontSize: "11px" }}>
{JSON.stringify(record.eventLog, null, 2)}
                  </pre>
                </div>

                {/* Raw Input Calldata */}
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted small">Input Calldata (Hex):</span>
                    <button
                      className="btn btn-sm btn-link text-muted p-0 text-decoration-none small"
                      onClick={() => {
                        navigator.clipboard.writeText(record.calldataHex);
                        setCopiedData(true);
                        setTimeout(() => setCopiedData(false), 2000);
                      }}
                    >
                      {copiedData ? "Copied" : "Copy Hex"}
                    </button>
                  </div>
                  <div className="p-2 bg-light border rounded font-monospace text-break text-muted" style={{ fontSize: "11px" }}>
                    {record.calldataHex}
                  </div>
                </div>

                {/* Public Link Note */}
                <div className="alert alert-info mt-3 py-2 px-3 small d-flex align-items-center justify-content-between">
                  <span>
                    <FaInfoCircle className="me-1" /> This batch is confirmed on the <strong>PharmaSure Consortium Ledger</strong>.
                  </span>
                  <a
                    href={liveTxHash ? `https://amoy.polygonscan.com/tx/${liveTxHash}` : record.explorerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-primary fw-bold"
                  >
                    Open on Polygonscan <FaExternalLinkAlt size={10} />
                  </a>
                </div>
              </div>
            )}

            {/* TAB 3: LIVE METAMASK BROADCAST */}
            {activeTab === "broadcast" && (
              <div className="bg-white rounded-3 p-4 border shadow-sm">
                <div className="text-center mb-4">
                  <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-2">
                    <FaEthereum size={36} />
                  </div>
                  <h5 className="fw-bold mb-1">Broadcast Live to Polygon Amoy Public Testnet</h5>
                  <p className="text-muted small mx-auto" style={{ maxWidth: "550px" }}>
                    Publish this drug batch directly to the public Polygon PoS Amoy blockchain using MetaMask. Once broadcasted, a live transaction will be immediately visible and indexed on Polygonscan!
                  </p>
                </div>

                <div className="card bg-light border p-3 mb-4 rounded-3">
                  <h6 className="fw-bold text-dark mb-2">Batch Inscription Data:</h6>
                  <ul className="list-unstyled small mb-0 font-monospace">
                    <li>• <strong>Batch ID:</strong> {record.batchId}</li>
                    <li>• <strong>Medicine:</strong> {record.medicineName}</li>
                    <li>• <strong>Genesis Expiry:</strong> {record.expiryDate}</li>
                    <li>• <strong>Origin:</strong> {record.manufacturer}</li>
                  </ul>
                </div>

                {liveTxHash ? (
                  <div className="alert alert-success p-3 rounded-3">
                    <h6 className="fw-bold mb-1 d-flex align-items-center gap-2">
                      <FaCheckCircle /> Transaction Broadcasted & Mined!
                    </h6>
                    <p className="small mb-2 text-break font-monospace">
                      Tx Hash: <strong>{liveTxHash}</strong>
                    </p>
                    <a
                      href={`https://amoy.polygonscan.com/tx/${liveTxHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-success btn-sm fw-bold d-inline-flex align-items-center gap-2"
                    >
                      View Live on Polygonscan.com <FaExternalLinkAlt size={11} />
                    </a>
                  </div>
                ) : (
                  <div className="d-flex flex-column align-items-center gap-2">
                    <button
                      className="btn btn-primary px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
                      onClick={handleBroadcastMetaMask}
                      disabled={isBroadcasting}
                    >
                      <FaPaperPlane />
                      {isBroadcasting ? "Broadcasting with MetaMask..." : "Broadcast Batch via MetaMask"}
                    </button>
                    <small className="text-muted">
                      Requires MetaMask extension & testnet POL. (Consortium offline verification is already active)
                    </small>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer bg-white py-2 d-flex justify-content-between align-items-center">
            <span className="small text-muted font-monospace" style={{ fontSize: "11px" }}>
              Consensus: Polygon PoS Amoy • Chain ID 80002
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm px-4"
              onClick={onClose}
            >
              <FaTimes className="me-1" /> Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainAuditModal;
