import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import express from 'express';
import { apiRouter } from './server/apiRouter.ts';

dotenv.config();

function expressApiPlugin(): Plugin {
  const app = express();
  app.use(express.json({ limit: '25mb' }));
  app.use(apiRouter);

  return {
    name: 'express-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api', (req, res, next) => {
        app(req as any, res as any, next);
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), expressApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
