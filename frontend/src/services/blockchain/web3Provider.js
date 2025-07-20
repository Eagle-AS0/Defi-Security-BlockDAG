import Web3 from 'web3';
import { config } from '../utils/config.js';

class Web3Provider {
  constructor() {
    this.web3 = null;
    this.account = null;
    this.networkId = null;
    this.guardContract = null;

    this._handleAccountChange = this._handleAccountChange.bind(this);
    this._handleChainChange = this._handleChainChange.bind(this);
  }

  async initialize(abi, contractAddress, injectedWeb3 = null) {
    try {
      if (injectedWeb3) {
        this.web3 = injectedWeb3;
      } else if (window.ethereum) {
        this.web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } else {
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.BLOCKCHAIN.HARDHAT_RPC));
      }

      const accounts = await this.web3.eth.getAccounts();
      this.account = accounts[0] || null;
      this.networkId = await this.web3.eth.net.getId();

      if (abi && contractAddress) {
        this.guardContract = new this.web3.eth.Contract(abi, contractAddress);
      }

      this._setupListeners();

      return this.web3;
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      throw error;
    }
  }

  _setupListeners() {
    if (!window.ethereum) return;

    window.ethereum.removeListener('accountsChanged', this._handleAccountChange);
    window.ethereum.removeListener('chainChanged', this._handleChainChange);

    window.ethereum.on('accountsChanged', this._handleAccountChange);
    window.ethereum.on('chainChanged', this._handleChainChange);
  }

  _handleAccountChange(accounts) {
    if (accounts.length > 0) {
      this.account = accounts[0];
      console.log('Account changed:', this.account);
    } else {
      console.warn('No accounts available.');
      this.account = null;
    }
  }

  _handleChainChange(_chainId) {
    console.log('Network changed. Reloading...');
    window.location.reload();
  }

  async switchNetwork(chainId) {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${Number(chainId).toString(16)}` }],
      });
      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      return false;
    }
  }

  getContract(abi, address) {
    if (!this.web3) throw new Error('Web3 not initialized');
    if (!address) throw new Error('Contract address not provided');
    return new this.web3.eth.Contract(abi, address);
  }

  async sendTransaction(to, data, value = 0) {
    if (!this.account) throw new Error('No account connected');

    const gasPrice = await this.web3.eth.getGasPrice();
    const gasEstimate = await this.web3.eth.estimateGas({
      from: this.account,
      to,
      data,
      value,
    });

    return this.web3.eth.sendTransaction({
      from: this.account,
      to,
      data,
      value,
      gas: gasEstimate,
      gasPrice,
    });
  }

  async isPaused() {
    if (!this.guardContract) throw new Error('Guard contract not initialized');
    return await this.guardContract.methods.paused().call();
  }

  async unpauseContract(privateKey) {
    if (!this.guardContract) throw new Error('Guard contract not initialized');
    if (!this.account) throw new Error('No account connected');

    const nonce = await this.web3.eth.getTransactionCount(this.account, 'latest');
    const gasPrice = await this.web3.eth.getGasPrice();

    const tx = {
      to: this.guardContract.options.address,
      data: this.guardContract.methods.unpause().encodeABI(),
      gas: 300000,
      gasPrice,
      nonce,
      chainId: this.networkId,
    };

    const signed = await this.web3.eth.accounts.signTransaction(tx, privateKey);
    return this.web3.eth.sendSignedTransaction(signed.rawTransaction);
  }

  getCurrentAccount() {
    return this.account;
  }

  getNetworkId() {
    return this.networkId;
  }

  getWeb3() {
    return this.web3;
  }

  disconnect() {
    this.account = null;
    this.guardContract = null;
    this.networkId = null;
    this.web3 = null;

    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', this._handleAccountChange);
      window.ethereum.removeListener('chainChanged', this._handleChainChange);
    }
  }
}

export default new Web3Provider();
