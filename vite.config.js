import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function geminiApiPlugin() {
  return {
    name: 'gemini-api-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        
        if (url === '/api/gemini/health' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          try {
            const { getAccessToken } = await import('./src/server/geminiService.js');
            const token = await getAccessToken();
            res.end(JSON.stringify({ status: 'ok', authenticated: !!token, model: 'gemini-2.5-flash' }));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ status: 'error', error: err.message }));
          }
          return;
        }

        if (url === '/api/gemini/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const { query, history } = JSON.parse(body || '{}');
              if (!query || typeof query !== 'string') {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Query is required' }));
                return;
              }

              const { askGeminiGovernmentAi } = await import('./src/server/geminiService.js');
              const result = await askGeminiGovernmentAi(query, history || []);
              res.end(JSON.stringify(result));
            } catch (err) {
              console.error('[Gemini API Server Error]:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), geminiApiPlugin()],
})

