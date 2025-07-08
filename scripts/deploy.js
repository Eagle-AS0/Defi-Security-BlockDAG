const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  const Token = await ethers.getContractFactory("TestToken");
  const token = await Token.deploy("MockToken", "MTK", 18, ethers.parseUnits("1000000", 18));
  console.log("Token deployed at:", token.target); // .target gives contract address in ethers v6

  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(token.target);
  console.log("Vault deployed at:", vault.target);

  const Guard = await ethers.getContractFactory("Guard");
  const guard = await Guard.deploy(vault.target, 1000);
  console.log("Guard deployed at:", guard.target);

  const tx = await vault.setGuardContract(guard.target);
  await tx.wait();
  console.log("Guard contract set in Vault");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
