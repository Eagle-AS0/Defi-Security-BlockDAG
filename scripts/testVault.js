const { ethers } = require("hardhat");

async function main() {
  const [owner, guardSigner] = await ethers.getSigners();

  const vaultAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const guardAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // MTK

  const token = await ethers.getContractAt("TestToken", tokenAddress);
  const vault = await ethers.getContractAt("Vault", vaultAddress);
  const guard = await ethers.getContractAt("Guard", guardAddress);

  const amount = ethers.parseUnits("100", 18);

  // 1. Approve vault to spend tokens
  const approveTx = await token.connect(owner).approve(vaultAddress, amount);
  await approveTx.wait();
  console.log("Vault approved to spend 100 MTK");

  // 2. Deposit 100 MTK
  const depositTx = await vault.connect(owner).deposit(amount);
  await depositTx.wait();
  console.log("Deposited 100 MTK");

  // 3. Owner withdraws 50 MTK on behalf of user via Guard
  const withdrawAmount = ethers.parseUnits("50", 18);
  const withdrawTx = await guard.connect(owner).withdrawFromVault(owner.address, withdrawAmount);
  await withdrawTx.wait();
  console.log("Withdrawn 50 MTK from Vault via Guard by owner");

  // 4. Pause vault via Guard owner
  const pauseTx = await guard.connect(owner).pause();
  await pauseTx.wait();
  console.log("Vault is now paused");

  // 5. Try deposit again (should fail due to pause)
  try {
    await vault.connect(owner).deposit(amount);
    console.error("❌ Deposit succeeded when it should have failed");
  } catch (err) {
    console.log("✅ Deposit failed as expected due to pause");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
