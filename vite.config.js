import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'; // If you're using React
import nodeResolve from '@rollup/plugin-node-resolve'; // Import the plugin

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: './src',
    server: {
      open: true,
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
    plugins: [
      react(), // If you're using React
      nodeResolve({  // Add the plugin here
        browser: true, // Important: tells Rollup to prioritize browser-friendly versions of dependencies
      }),
    ],
    resolve: {
      alias: {
        crypto: 'crypto-js', // This alias might not even be necessary anymore
      },
    },
  };
});