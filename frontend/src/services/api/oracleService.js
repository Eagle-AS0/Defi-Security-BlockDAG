import { Contract } from 'ethers';
import  OracleArtifact  from '../../../../artifacts/contracts/Oracle.sol/Oracle.json';
const ORACLE_ABI = OracleArtifact.abi;

import { config } from '../../utils/config';

class OracleService {
  constructor() {
    this.contract = null;
    this.signer = null;
  }

  // Initialize with signer and contract address from config
  async initialize(signer) {
    if (!signer) throw new Error("No signer provided to OracleService");

    const address = config.ADDRESSES.ORACLE;
    if (!address) throw new Error("ORACLE_ADDRESS missing in config");

    this.signer = signer;
    this.contract = new Contract(address, ORACLE_ABI, signer);
  }

  // Fetch the full oracle data tuple: [field1, field2, threatLevel]
  async getOracleData() {
    if (!this.contract) throw new Error("Contract not initialized");
    const data = await this.contract.getOracleData();
    return {
      field1: data[0],
      field2: data[1],
      threatLevel: data[2],
    };
  }

  // Convenience method to fetch only threatLevel
  async getThreatLevel() {
    const data = await this.getOracleData();
    return data.threatLevel;
  }

  // Subscribe to OracleDataUpdated event
  subscribeToEvents(callback) {
    if (!this.contract) throw new Error("Contract not initialized");

    this.contract.on("OracleDataUpdated", (field1, field2, threatLevel, event) => {
      callback("OracleDataUpdated", { field1, field2, threatLevel, event });
    });
  }
}

export default new OracleService();
