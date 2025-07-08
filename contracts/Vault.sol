// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract Vault is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    address public guardContract;

    uint256 public totalDeposited;
    uint256 public totalWithdrawn;

    // User balances and timestamps
    mapping(address => uint256) public userBalances;
    mapping(address => uint256) public userDepositTime;

    // Events
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event GuardContractUpdated(address indexed oldGuard, address indexed newGuard);

    modifier onlyGuard() {
        require(msg.sender == guardContract || msg.sender == owner(), "Vault: Not authorized");
        _;
    }

    // Constructor with Ownable base constructor call
 constructor(address _token) Ownable(msg.sender) {
    require(_token != address(0), "Vault: zero token address");
    token = IERC20(_token);
}


    function setGuardContract(address _guardContract) external onlyOwner {
        require(_guardContract != address(0), "Vault: zero guard address");
        address oldGuard = guardContract;
        guardContract = _guardContract;
        emit GuardContractUpdated(oldGuard, _guardContract);
    }

    function deposit(uint256 amount) external whenNotPaused nonReentrant {
        require(amount > 0, "Vault: amount zero");
        require(token.allowance(msg.sender, address(this)) >= amount, "Vault: allowance low");

        token.safeTransferFrom(msg.sender, address(this), amount);

        userBalances[msg.sender] += amount;
        userDepositTime[msg.sender] = block.timestamp;
        totalDeposited += amount;

        emit Deposited(msg.sender, amount);
    }

    /**
     * @dev Withdraw only callable by Guard contract or owner
     */
    function withdraw(address user, uint256 amount) external onlyGuard whenNotPaused nonReentrant {
        require(amount > 0, "Vault: amount zero");
        require(userBalances[user] >= amount, "Vault: insufficient balance");

        userBalances[user] -= amount;
        totalWithdrawn += amount;

        token.safeTransfer(user, amount);

        emit Withdrawn(user, amount);
    }

    // Emergency pause/unpause by owner
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Read function for user balance
    function balanceOf(address user) external view returns (uint256) {
        return userBalances[user];
    }
}
