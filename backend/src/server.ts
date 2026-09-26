import http from 'http';
import app from './app';
import { env } from './config/env';
import { initSocketIO } from './socket';

const server = http.createServer(app);

// Initialize Socket.IO Gateway
initSocketIO(server);

const PORT = env.PORT;

server.listen(PORT, () => {
 console.log(` IT Helpdesk Backend API & Socket.IO running on http://localhost:${PORT}`);
});
