
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Vault.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Guard is Ownable, ReentrancyGuard {
    Vault public vault;
    uint256 public withdrawThreshold;
    address public backendOracle;
    uint256 public lastPausedTime;
    uint256 public cooldown = 5 minutes;
    uint256 public riskScore;
    
    // Enhanced mappings
    mapping(address => bool) public flaggedUsers;
    mapping(address => uint256) public userRiskScores;
    mapping(address => uint256) public lastActivityTime;
    mapping(string => bool) public knownAttackTypes;
    
    // Risk management
    uint256 public constant MAX_RISK_SCORE = 100;
    uint256 public constant HIGH_RISK_THRESHOLD = 80;
    uint256 public constant MEDIUM_RISK_THRESHOLD = 50;
    uint256 public pauseCount;
    
    // Events
    event VaultPaused(string reason, uint256 timestamp, uint256 globalRisk);
    event VaultUnpaused(uint256 timestamp);
    event ThresholdUpdated(uint256 oldThreshold, uint256 newThreshold);
    event UserFlagged(address indexed user, string reason, uint256 userRisk);
    event UserCleared(address indexed user, uint256 timestamp);
    event ActivityLogged(address indexed user, string action, uint256 timestamp);
    event RiskScoreUpdated(uint256 oldScore, uint256 newScore);
    event AttackSimulated(string attackType, uint256 amount);
    event CooldownUpdated(uint256 oldCooldown, uint256 newCooldown);
    event OracleUpdated(address oldOracle, address newOracle);
    
    // Custom errors
    error UnauthorizedAccess();
    error CooldownActive();
    error InvalidThreshold();
    error InvalidRiskScore();
    error InvalidCooldown();
    error VaultAlreadyPaused();
    error VaultNotPaused();
    error UserNotFlagged();
    error ZeroAddress();
    
    modifier onlyOracle() {
        if (msg.sender != backendOracle && msg.sender != owner()) {
            revert UnauthorizedAccess();
        }
        _;
    }
    
    modifier afterCooldown() {
        if (block.timestamp < lastPausedTime + cooldown) {
            revert CooldownActive();
        }
        _;
    }
    
    modifier validAddress(address _addr) {
        if (_addr == address(0)) {
            revert ZeroAddress();
        }
        _;
    }
    
    constructor(address _vaultAddress, uint256 _threshold) validAddress(_vaultAddress) {
        if (_threshold == 0) {
            revert InvalidThreshold();
        }
        
        vault = Vault(_vaultAddress);
        withdrawThreshold = _threshold;
        riskScore = 0;
        pauseCount = 0;
    }
    
    /**
     * @dev Set backend oracle address
     */
    function setOracle(address _oracle) external onlyOwner validAddress(_oracle) {
        address oldOracle = backendOracle;
        backendOracle = _oracle;
        emit OracleUpdated(oldOracle, _oracle);
    }
    
    /**
     * @dev Update withdrawal threshold
     */
    function updateThreshold(uint256 _newThreshold) external onlyOwner {
        if (_newThreshold == 0) {
            revert InvalidThreshold();
        }
        
        uint256 oldThreshold = withdrawThreshold;
        withdrawThreshold = _newThreshold;
        emit ThresholdUpdated(oldThreshold, _newThreshold);
    }
    
    /**
     * @dev Update cooldown period
     */
    function updateCooldown(uint256 _newCooldown) external onlyOwner {
        if (_newCooldown == 0 || _newCooldown > 1 hours) {
            revert InvalidCooldown();
        }
        
        uint256 oldCooldown = cooldown;
        cooldown = _newCooldown;
        emit CooldownUpdated(oldCooldown, _newCooldown);
    }
    
    /**
     * @dev Flag user with risk assessment
     */
    function flagUser(address user, string memory reason) external onlyOracle validAddress(user) {
        flaggedUsers[user] = true;
        userRiskScores[user] = userRiskScores[user] + 20; // Increase user risk
        
        if (userRiskScores[user] > MAX_RISK_SCORE) {
            userRiskScores[user] = MAX_RISK_SCORE;
        }
        
        emit UserFlagged(user, reason, userRiskScores[user]);
        logActivity(user, "FLAGGED");
        
        // Auto-pause if user risk is too high
        if (userRiskScores[user] >= HIGH_RISK_THRESHOLD) {
            _pauseVault("High-risk user detected");
        }
    }
    
    /**
     * @dev Clear user flag and reset risk
     */
    function clearUser(address user) external onlyOwner validAddress(user) {
        if (!flaggedUsers[user]) {
            revert UserNotFlagged();
        }
        
        flaggedUsers[user] = false;
        userRiskScores[user] = 0;
        emit UserCleared(user, block.timestamp);
        logActivity(user, "CLEARED");
    }
    
    /**
     * @dev Enhanced check and pause with multiple conditions
     */
    function checkAndPause(
        uint256 suspiciousAmount, 
        string memory reason,
        address suspiciousUser
    ) external onlyOracle nonReentrant {
        if (vault.paused()) {
            revert VaultAlreadyPaused();
        }
        
        bool shouldPause = false;
        string memory pauseReason = reason;
        
        // Check amount threshold
        if (suspiciousAmount >= withdrawThreshold) {
            shouldPause = true;
            pauseReason = string(abi.encodePacked("Threshold exceeded: ", reason));
        }
        
        // Check if user is flagged
        if (suspiciousUser != address(0) && flaggedUsers[suspiciousUser]) {
            shouldPause = true;
            pauseReason = string(abi.encodePacked("Flagged user activity: ", reason));
        }
        
        // Check global risk score
        if (riskScore >= HIGH_RISK_THRESHOLD) {
            shouldPause = true;
            pauseReason = "High global risk score";
        }
        
        if (shouldPause) {
            _pauseVault(pauseReason);
        }
        
        // Log activity regardless
        if (suspiciousUser != address(0)) {
            logActivity(suspiciousUser, "SUSPICIOUS_ACTIVITY");
        }
    }
    
    /**
     * @dev Update global risk score
     */
    function updateRiskScore(uint256 newScore) external onlyOracle {
        if (newScore > MAX_RISK_SCORE) {
            revert InvalidRiskScore();
        }
        
        uint256 oldScore = riskScore;
        riskScore = newScore;
        emit RiskScoreUpdated(oldScore, newScore);
        
        if (riskScore >= HIGH_RISK_THRESHOLD && !vault.paused()) {
            _pauseVault("High global risk score detected");
        }
    }
    
    /**
     * @dev Simulate attack for testing
     */
    function simulateAttack(
        uint256 amount, 
        string memory attackType,
        string memory reason
    ) external onlyOwner {
        // Add attack type to known attacks
        knownAttackTypes[attackType] = true;
        
        _pauseVault(reason);
        emit AttackSimulated(attackType, amount);
    }
    
    /**
     * @dev Unpause vault with enhanced checks
     */
    function unpauseVault() external onlyOwner afterCooldown {
        if (!vault.paused()) {
            revert VaultNotPaused();
        }
        
        // Additional safety checks before unpausing
        require(riskScore < HIGH_RISK_THRESHOLD, "Global risk too high");
        
        vault.setPause(false);
        emit VaultUnpaused(block.timestamp);
    }
    
    /**
     * @dev Emergency unpause (bypasses cooldown)
     */
    function emergencyUnpause() external onlyOwner {
        if (!vault.paused()) {
            revert VaultNotPaused();
        }
        
        vault.setPause(false);
        emit VaultUnpaused(block.timestamp);
    }
    
    /**
     * @dev Internal pause function
     */
    function _pauseVault(string memory reason) internal {
        if (!vault.paused()) {
            vault.setPause(true);
            lastPausedTime = block.timestamp;
            pauseCount++;
            emit VaultPaused(reason, block.timestamp, riskScore);
        }
    }
    
    /**
     * @dev Enhanced activity logging
     */
    function logActivity(address user, string memory action) internal {
        lastActivityTime[user] = block.timestamp;
        emit ActivityLogged(user, action, block.timestamp);
    }
    
    /**
     * @dev Public function to log activity (for external calls)
     */
    function logUserActivity(address user, string memory action) external onlyOracle {
        logActivity(user, action);
    }
    
    /**
     * @dev Get user risk information
     */
    function getUserRisk(address user) external view returns (
        bool isFlagged,
        uint256 riskScore,
        uint256 lastActivity
    ) {
        return (
            flaggedUsers[user],
            userRiskScores[user],
            lastActivityTime[user]
        );
    }
    
    /**
     * @dev Get system status
     */
    function getSystemStatus() external view returns (
        bool isPaused,
        uint256 globalRisk,
        uint256 threshold,
        uint256 cooldownRemaining,
        uint256 totalPauses
    ) {
        uint256 remaining = 0;
        if (vault.paused() && block.timestamp < lastPausedTime + cooldown) {
            remaining = (lastPausedTime + cooldown) - block.timestamp;
        }
        
        return (
            vault.paused(),
            riskScore,
            withdrawThreshold,
            remaining,
            pauseCount
        );
    }
    
    /**
     * @dev Check if attack type is known
     */
    function isKnownAttack(string memory attackType) external view returns (bool) {
        return knownAttackTypes[attackType];
    }
    
    /**
     * @dev Batch flag multiple users
     */
    function batchFlagUsers(
        address[] calldata users,
        string[] calldata reasons
    ) external onlyOracle {
        require(users.length == reasons.length, "Arrays length mismatch");
        
        for (uint256 i = 0; i < users.length; i++) {
            if (users[i] != address(0)) {
                flaggedUsers[users[i]] = true;
                userRiskScores[users[i]] = userRiskScores[users[i]] + 20;
                
                if (userRiskScores[users[i]] > MAX_RISK_SCORE) {
                    userRiskScores[users[i]] = MAX_RISK_SCORE;
                }
                
                emit UserFlagged(users[i], reasons[i], userRiskScores[users[i]]);
                logActivity(users[i], "BATCH_FLAGGED");
            }
        }
    }
    
    /**
     * @dev Reset all user risks (emergency function)
     */
    function resetAllUserRisks() external onlyOwner {
        // Note: This would need to be implemented with a separate tracking system
        // for production use, as we can't iterate over all mapping keys
        riskScore = 0;
        emit RiskScoreUpdated(riskScore, 0);
    }
}
