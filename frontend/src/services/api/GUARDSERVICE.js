import { Contract } from "ethers";
import GuardArtifact from "../../../../artifacts/contracts/Guard.sol/Guard.json";

const GUARD_ABI = GuardArtifact.abi;

import { config } from "../../utils/config";

class GuardService {
  constructor() {
    this.contract = null;
    this.signer = null;
    console.log("Guard ABI:", GUARD_ABI); // Log the ABI on class instantiation
  }

  async initialize(signer) {
    if (!signer) throw new Error("No signer provided to GuardService");

    const address = config.ADDRESSES.GUARD;
    console.log("GUARD address:", address); 
    if (!address) throw new Error("GUARD address is missing in config");

    this.signer = signer;
    this.contract = new Contract(address, GUARD_ABI, signer);

    // Log contract interface fragments to verify ABI is loaded correctly
    console.log("Contract interface fragments:", this.contract.interface.fragments);
  }

  async getThreshold() {
    if (!this.contract) throw new Error("Contract not initialized");
    return await this.contract.withdrawThreshold();
  }

  async setWithdrawThreshold(newThreshold) {
    if (!this.contract) throw new Error("Contract not initialized");
    return await this.contract.setWithdrawThreshold(newThreshold);
  }

  async isPaused() {
    if (!this.contract) throw new Error("Contract not initialized");
    return await this.contract.paused();
  }

  async pause() {
    if (!this.contract) throw new Error("Contract not initialized");
    return await this.contract.pauseVault(true); // use pauseVault(true) instead of pause()
  }

  async unpause() {
    if (!this.contract) throw new Error("Contract not initialized");
    return await this.contract.pauseVault(false); // use pauseVault(false) instead of unpause()
  }

  async isThreatDetected() {
    if (!this.contract) throw new Error("Contract not initialized");
    return await this.contract.isThreatDetected();
  }

  subscribeToEvents(callback) {
    if (!this.contract) throw new Error("Contract not initialized");

    this.contract.on("WithdrawThresholdUpdated", (oldThreshold, newThreshold, event) => {
      callback("WithdrawThresholdUpdated", { oldThreshold, newThreshold, event });
    });

    this.contract.on("WithdrawalAttempt", (user, amount, allowed, event) => {
      callback("WithdrawalAttempt", { user, amount, allowed, event });
    });
  }
}

export default new GuardService();
