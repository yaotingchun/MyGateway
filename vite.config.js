import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function geminiApiPlugin() {
  return {
    name: 'gemini-api-server',
    configureServer(server) {
      // Attach WebSocket for real-time STT
      if (server.httpServer) {
        import('./src/server/speechService.js')
          .then(({ setupSpeechWebSocket }) => {
            setupSpeechWebSocket(server.httpServer);
          })
          .catch((e) => console.warn('[Speech WS Init Note]:', e.message));
      }

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

        if (url === '/api/auth/login' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            res.setHeader('Content-Type', 'application/json');
            try {
              const { icNumber, password } = JSON.parse(body || '{}');
              if (!icNumber) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Malaysian IC Number is required' }));
                return;
              }

              const { authenticateCitizen } = await import('./src/server/authService.js');
              const result = await authenticateCitizen(icNumber, password);
              res.end(JSON.stringify(result));
            } catch (err) {
              console.error('[Auth API Server Error]:', err);
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message || 'Authentication failed' }));
            }
          });
          return;
        }

        if (url === '/api/tts' && (req.method === 'POST' || req.method === 'GET')) {
          const handleTts = async (text, voiceName, languageCode) => {
            try {
              const { synthesizeTextToSpeech } = await import('./src/server/speechService.js');
              const audioBuffer = await synthesizeTextToSpeech(text, voiceName, languageCode);
              res.setHeader('Content-Type', 'audio/mpeg');
              res.end(audioBuffer);
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'TTS synthesis failed' }));
            }
          };

          if (req.method === 'GET') {
            const parsedUrl = new URL(req.url, 'http://localhost');
            const text = parsedUrl.searchParams.get('text');
            const voiceName = parsedUrl.searchParams.get('voiceName');
            const languageCode = parsedUrl.searchParams.get('languageCode');
            if (!text) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Text query parameter is required' }));
              return;
            }
            return handleTts(text, voiceName, languageCode);
          } else {
            let body = '';
            req.on('data', (chunk) => { body += chunk; });
            req.on('end', async () => {
              const { text, voiceName, languageCode } = JSON.parse(body || '{}');
              if (!text) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Text is required in body' }));
                return;
              }
              return handleTts(text, voiceName, languageCode);
            });
            return;
          }
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


