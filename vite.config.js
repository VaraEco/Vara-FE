import { defineConfig, loadEnv} from "vite";
import react from "@vitejs/plugin-react";

const EnvKeys = [
    "REACT_APP_AWS_ACCESS_KEY_ID",
    "REACT_APP_AWS_SECRET_ACCESS_KEY",
    "REACT_APP_BACKEND_S3_API",
    "REACT_APP_BACKEND_TEXTRACT_API",
    "REACT_APP_BACKEND_CHATBOT_API"
  ];

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const processEnv = {};
    EnvKeys.forEach(key => processEnv[key] = env[key]);

    return {
      define: {
        'process.env': processEnv
      },
      plugins: [react()],
      server: {
        port: 3000,
      },
      build: {
        chunkSizeWarningLimit: 1600
    },
    }
})
