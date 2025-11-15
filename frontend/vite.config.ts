import react from '@vitejs/plugin-react';
import fs from 'fs';
import { defineConfig } from 'vite';

const certPath = process.env.VITE_SSL_CERT || '/app/certs/cert.pem';
const keyPath = process.env.VITE_SSL_KEY || '/app/certs/key.pem';

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      cert: fs.existsSync(certPath) ? fs.readFileSync(certPath) : undefined,
      key: fs.existsSync(keyPath) ? fs.readFileSync(keyPath) : undefined,
    },
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
});
