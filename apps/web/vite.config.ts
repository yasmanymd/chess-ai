import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [reactRouter()],
  server: {
    host: '0.0.0.0',
    allowedHosts: ['web'],
    // Browser clients outside Docker must retain the hostname they used to reach
    // the development server instead of falling back to localhost inside the VM.
    hmr: {
      clientPort: 5173,
    },
  },
});
