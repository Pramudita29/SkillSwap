import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve('D:/skillswap-backend/cert', 'server.key')),
      cert: fs.readFileSync(path.resolve('D:/skillswap-backend/cert', 'server.crt')),
    },
    port: 3000, // Port for local development
    cors: {
      origin: 'https://localhost:3000', // Ensure this matches the frontend's URL
      credentials: true,
    },
  },
});
