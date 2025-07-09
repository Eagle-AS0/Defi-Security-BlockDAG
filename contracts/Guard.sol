// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IVault {
    function withdraw(address user, uint256 amount) external;
}

interface IOracle {
    function getOracleData() external view returns (uint256, uint256, uint256);
}

contract Guard is Ownable, ReentrancyGuard {
    IVault public vault;
    IOracle public oracle;

    uint256 public withdrawThreshold;
    bool public paused;

    event Paused();
    event Unpaused();
    event WithdrawThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event WithdrawalAttempt(address indexed user, uint256 amount, bool allowed);

    modifier notPaused() {
        require(!paused, "Guard: paused");
        _;
    }

    constructor(address _vault, uint256 _withdrawThreshold, address _oracle) Ownable(msg.sender) {
        require(_vault != address(0), "Guard: zero vault address");
        require(_oracle != address(0), "Guard: zero oracle address");

        vault = IVault(_vault);
        withdrawThreshold = _withdrawThreshold;
        oracle = IOracle(_oracle);
        paused = false;
    }

    function setWithdrawThreshold(uint256 _withdrawThreshold) external onlyOwner {
        emit WithdrawThresholdUpdated(withdrawThreshold, _withdrawThreshold);
        withdrawThreshold = _withdrawThreshold;
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused();
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused();
    }

    function guardedWithdraw(uint256 amount) external notPaused nonReentrant {
        bool allowed = amount <= withdrawThreshold;
        emit WithdrawalAttempt(msg.sender, amount, allowed);
        require(allowed, "Guard: exceeds withdrawal threshold");

        vault.withdraw(msg.sender, amount);
    }

    function withdrawFromVault(address user, uint256 amount) external onlyOwner {
        vault.withdraw(user, amount);
    }

    // Oracle integration
    function isThreatDetected() public view returns (bool) {
        (, , uint256 alertLevel) = oracle.getOracleData();
        return alertLevel > 2; // Example threshold logic
    }
}
