import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Load environment variables based on the current mode (development/production)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    root: './src', // Set the root to the `src` folder
    server: {
      open: true, // Automatically open the browser
      proxy: {
        // Proxy API requests to Netlify Functions
        '/api': 'http://localhost:8888', 
      },
    },
    build: {
      outDir: '../dist', // Ensure build output is in `dist`
      emptyOutDir: true,
    },
    define: {
      // Expose only PUBLIC environment variables
      'import.meta.env.VITE_PUBLIC_KEY': JSON.stringify(env.VITE_PUBLIC_KEY),
    },
  };
});
