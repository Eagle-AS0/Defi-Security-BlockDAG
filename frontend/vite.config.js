import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/monitor': {
        target: 'http://127.0.0.1:5000', // Use IPv4 loopback to avoid IPv6 issues
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'ws://127.0.0.1:5000',
        ws: true,
        timeout: 10000,
      },
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
        ws: true,
      },
    },
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
  },
});
