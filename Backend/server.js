import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
