import http from 'node:http';
import { createApp } from './app.js';
import { initWsServer } from './services/ws.service.js';

const port = Number(process.env.PORT ?? 3000);
const app = createApp();
const server = http.createServer(app);

initWsServer(server);

server.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
