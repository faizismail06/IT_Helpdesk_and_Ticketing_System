import http from 'http';
import app from './app';
import { env } from './config/env';
import { initSocketIO } from './socket';
import { startSlaMonitor } from './services/sla.service';

const server = http.createServer(app);

// Initialize Socket.IO Gateway
initSocketIO(server);
startSlaMonitor();

const PORT = env.PORT;

server.listen(PORT, () => {
 console.log(`IT Helpdesk Backend API & Socket.IO running on http://localhost:${PORT}`);
});
