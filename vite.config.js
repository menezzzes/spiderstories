import { defineConfig, loadEnv } from 'vite';


export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: './src', // Set the root to the `src` folder
    server: {
      open: true, // Automatically open the browser
    },
    define: {
      // Expose environment variables to your app
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  };
});