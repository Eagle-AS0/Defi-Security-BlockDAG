const { ethers } = require("hardhat");

async function main() {
  const Oracle = await ethers.getContractFactory("Oracle");
  const oracle = await Oracle.deploy();

  await oracle.waitForDeployment();

  console.log("Oracle deployed at:", await oracle.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
