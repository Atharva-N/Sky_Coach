import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const { GROQ_API_KEY } = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/atcstream': {
          target: 'https://d.liveatc.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/atcstream/, '/kaus3_app_dep'),
          secure: false,
        },
        '/api/groq': {
          target: 'https://api.groq.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/groq/, '/openai/v1'),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (GROQ_API_KEY) {
                proxyReq.setHeader('Authorization', `Bearer ${GROQ_API_KEY}`)
              }
            })
          },
        },
      },
    },
  }
})
