// server.js (backend folder)
const express = require('express');
const WebSocket = require('ws');

const app = express();
const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
  console.log(`HTTP server running on port ${port}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    console.log('Received:', message);
    // Respond to client or broadcast
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});
