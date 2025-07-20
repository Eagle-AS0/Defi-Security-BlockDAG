export const config = {
  API_URL: import.meta.env.VITE_API_URL,
  WEBSOCKET_URL: import.meta.env.VITE_WS_URL,

  BLOCKCHAIN: {
    HARDHAT_RPC: import.meta.env.VITE_HARDHAT_RPC,
    BLOCKDAG_RPC: import.meta.env.VITE_BLOCKDAG_RPC,
    CHAIN_ID: Number(import.meta.env.VITE_CHAIN_ID),
  },

  ADDRESSES: {
    TOKEN: import.meta.env.VITE_TOKEN_ADDRESS,
    VAULT: import.meta.env.VITE_VAULT_ADDRESS,
    ORACLE: import.meta.env.VITE_ORACLE_ADDRESS,
    GUARD: import.meta.env.VITE_GUARD_ADDRESS,
  },

  REFRESH_INTERVALS: {
    CONTRACT_DATA: 5000,  // Add this line with your desired interval in ms
  },
};
