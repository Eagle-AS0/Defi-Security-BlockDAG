const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);

  // Deploy TestToken contract
  const Token = await ethers.getContractFactory("TestToken");
  const token = await Token.deploy(
    "MockToken",
    "MTK",
    18,
    ethers.parseUnits("1000000", 18)
  );
  await token.deploymentTransaction().wait();
  console.log("Token deployed at:", token.target);

  // Deploy Vault contract with token address
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(token.target);
  await vault.deploymentTransaction().wait();
  console.log("Vault deployed at:", vault.target);

  // Deploy Oracle contract
  const Oracle = await ethers.getContractFactory("Oracle");
  const oracle = await Oracle.deploy();
  await oracle.deploymentTransaction().wait();
  console.log("Oracle deployed at:", oracle.target);

  // Deploy Guard contract with Vault address, threshold, and Oracle address
  const Guard = await ethers.getContractFactory("Guard");
  const withdrawThreshold = ethers.parseUnits("1000", 18); // or just 1000 if no decimals required
  const guard = await Guard.deploy(vault.target, withdrawThreshold, oracle.target);
  await guard.deploymentTransaction().wait();
  console.log("Guard deployed at:", guard.target);

  // Set Guard contract address in Vault
  const tx = await vault.setGuardContract(guard.target);
  await tx.wait();
  console.log("Guard contract set in Vault");

  return {
    tokenAddress: token.target,
    vaultAddress: vault.target,
    oracleAddress: oracle.target,
    guardAddress: guard.target,
  };
}

main()
  .then(({ tokenAddress, vaultAddress, oracleAddress, guardAddress }) => {
    console.log("Deployment completed.");
    console.log("Token Address:", tokenAddress);
    console.log("Vault Address:", vaultAddress);
    console.log("Oracle Address:", oracleAddress);
    console.log("Guard Address:", guardAddress);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
