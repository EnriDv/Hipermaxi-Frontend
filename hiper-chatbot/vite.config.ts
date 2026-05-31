import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8000';
  const allowedHosts = env.VITE_ALLOWED_HOSTS
    ? env.VITE_ALLOWED_HOSTS.split(',').map((host) => host.trim()).filter(Boolean)
    : undefined;

  return {
    plugins: [react()],
    server: {
      allowedHosts: allowedHosts && allowedHosts.length > 0 ? allowedHosts : undefined,
      proxy: {
        '/auth': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/sessions': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/conversations': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/chat': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/tickets': {
          target: proxyTarget,
          changeOrigin: true,
        },
        '/health': {
          target: proxyTarget,
          changeOrigin: true,
        }
      }
    }
  };
});
