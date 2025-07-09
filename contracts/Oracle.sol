// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Oracle Contract for AI-based DeFi Security Monitoring
/// @notice Stores and updates metrics like txFrequency, poolDepth, and alertLevel from backend
contract Oracle {
    /// @notice Address allowed to update oracle data (AI backend or owner)
    address public updater;

    /// @notice Frequency of transactions (could represent suspicious spikes)
    uint256 public txFrequency;

    /// @notice Liquidity pool depth (used to detect sudden drains)
    uint256 public poolDepth;

    /// @notice Alert level set by AI (0: Low, 1: Medium, 2: High, 3: Critical)
    uint256 public alertLevel;

    /// @notice Emitted when oracle data is updated
    event OracleUpdated(uint256 txFrequency, uint256 poolDepth, uint256 alertLevel);

    /// @dev Constructor sets deployer as updater
    constructor() {
        updater = msg.sender;
    }

    /// @notice Restricts function to the current updater only
    modifier onlyUpdater() {
        require(msg.sender == updater, "Not authorized");
        _;
    }

    /// @notice Update oracle data; can only be called by the updater
    /// @param _txFrequency Number of suspicious txs
    /// @param _poolDepth Remaining pool liquidity
    /// @param _alertLevel Alert level (0–3)
    function updateOracleData(
        uint256 _txFrequency,
        uint256 _poolDepth,
        uint256 _alertLevel
    ) public onlyUpdater {
        txFrequency = _txFrequency;
        poolDepth = _poolDepth;
        alertLevel = _alertLevel;

        emit OracleUpdated(_txFrequency, _poolDepth, _alertLevel);
    }

    /// @notice Getter to fetch oracle data from frontend or contract
    function getOracleData()
        public
        view
        returns (uint256, uint256, uint256)
    {
        return (txFrequency, poolDepth, alertLevel);
    }

    /// @notice Change the updater address
    /// @param _newUpdater New updater address
    function setUpdater(address _newUpdater) public onlyUpdater {
        updater = _newUpdater;
    }
}

