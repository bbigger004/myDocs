import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, options) => {
          // 自定义代理日志
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log(`[Proxy] ${req.method} ${req.url} -> ${options.target}${proxyReq.path}`);
          });
          
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(`[Proxy] ${req.method} ${req.url} <- ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
          });
          
          proxy.on('error', (err, req, res) => {
            console.error(`[Proxy Error] ${req.method} ${req.url} - ${err.message}`);
          });
        },
      },
    },
  },
})
