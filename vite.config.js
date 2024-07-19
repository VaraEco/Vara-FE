import { defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
      define: {
        'process.env.REACT_APP_AWS_ACCESS_KEY_ID': JSON.stringify(env.REACT_APP_AWS_ACCESS_KEY_ID),
        'process.env.REACT_APP_AWS_SECRET_ACCESS_KEY': JSON.stringify(env.REACT_APP_AWS_SECRET_ACCESS_KEY)
      },
      plugins: [react()],
      server: {
        port: 3000,
      }
    }
  })
