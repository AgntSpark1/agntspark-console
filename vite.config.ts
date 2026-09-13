import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // loadEnv also picks up matching vars from the shell environment, so this
  // works as `VITE_DEV_PROXY_TARGET=http://localhost:8899 npm run dev`.
  const env = loadEnv(mode, '.', 'VITE_DEV_');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // agntspark-gateway's default dev port is 8080 (see agntspark-gateway
        // README / docker-compose.yml), and it serves bare /v1 — not /api/v1.
        // Override with VITE_DEV_PROXY_TARGET when 8080 is taken locally.
        '/v1': {
          target: env.VITE_DEV_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});
