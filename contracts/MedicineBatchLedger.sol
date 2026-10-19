// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MedicineBatchLedger
 * @dev Immutable Decentralized Pharmaceutical Provenance & Expiry Registry for Pharmasure
 * Conforms with DSCSA (Drug Supply Chain Security Act) track-and-trace requirements.
 */
contract MedicineBatchLedger {
    address public owner;

    struct BatchRecord {
        string batchId;
        string medicineName;
        uint256 expiryTimestamp;
        string manufacturer;
        uint256 blockMinted;
        address registeredBy;
        bool isRecalled;
    }

    // Mapping of Batch ID -> BatchRecord
    mapping(string => BatchRecord) private batches;
    string[] private allBatchIds;

    event BatchRegistered(
        string indexed batchId,
        string medicineName,
        uint256 expiryTimestamp,
        string manufacturer,
        uint256 blockNumber
    );

    event BatchRecalled(string indexed batchId, uint256 recallTimestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only authorized manufacturer/authority can execute");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Register a newly manufactured pharmaceutical batch with immutable expiry date
     */
    function registerBatch(
        string memory _batchId,
        string memory _medicineName,
        uint256 _expiryTimestamp,
        string memory _manufacturer
    ) external onlyOwner {
        require(bytes(batches[_batchId].batchId).length == 0, "Batch already registered on-chain");

        batches[_batchId] = BatchRecord({
            batchId: _batchId,
            medicineName: _medicineName,
            expiryTimestamp: _expiryTimestamp,
            manufacturer: _manufacturer,
            blockMinted: block.number,
            registeredBy: msg.sender,
            isRecalled: false
        });

        allBatchIds.push(_batchId);

        emit BatchRegistered(_batchId, _medicineName, _expiryTimestamp, _manufacturer, block.number);
    }

    /**
     * @notice Verify batch authenticity and tamper-free expiry status
     */
    function verifyBatch(string memory _batchId)
        external
        view
        returns (
            bool exists,
            string memory medicineName,
            uint256 expiryTimestamp,
            string memory manufacturer,
            uint256 blockMinted,
            bool isRecalled
        )
    {
        BatchRecord memory record = batches[_batchId];
        if (bytes(record.batchId).length == 0) {
            return (false, "", 0, "", 0, false);
        }
        return (
            true,
            record.medicineName,
            record.expiryTimestamp,
            record.manufacturer,
            record.blockMinted,
            record.isRecalled
        );
    }

    /**
     * @notice Flag an emergency batch recall (counterfeit or contamination detected)
     */
    function flagRecall(string memory _batchId) external onlyOwner {
        require(bytes(batches[_batchId].batchId).length > 0, "Batch not found");
        batches[_batchId].isRecalled = true;
        emit BatchRecalled(_batchId, block.timestamp);
    }

    function getTotalBatches() external view returns (uint256) {
        return allBatchIds.length;
    }
}
