import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5174,
    host: true,
    hmr: false,
    allowedHosts: [
      'localhost',
      'stream.argumind.space',
      'app.argumind.space',
      'api.argumind.space'
    ],
  }
});
