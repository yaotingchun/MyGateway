import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

import fs from 'fs';

// Use credentials file
const keyFilename = path.join(__dirname, 'credentials', 'google.json');
const credentials = JSON.parse(fs.readFileSync(keyFilename, 'utf8'));
const projectId = credentials.project_id;

// Initialize Google Cloud clients
// Use STT V2 API with the 'chirp_2' model in the 'asia-southeast1' location for fast, multilingual continuous dictation
const location = 'asia-southeast1';
const speechClient = new speech.v2.SpeechClient({ 
  keyFilename,
  apiEndpoint: `${location}-speech.googleapis.com`
});
const ttsClient = new textToSpeech.TextToSpeechClient({ keyFilename });

app.use(cors());
app.use(express.json());

// In-memory cache for TTS results to eliminate Google Cloud API roundtrip latency on repeated speech
const ttsCache = new Map();

// TTS POST endpoint with caching
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName, languageCode } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const cacheKey = `${text}_${voiceName || 'default'}_${languageCode || 'default'}`;
    if (ttsCache.has(cacheKey)) {
      console.log(`TTS API: Cache Hit for "${text.substring(0, 30)}..."`);
      res.setHeader('Content-Type', 'audio/mpeg');
      return res.send(ttsCache.get(cacheKey));
    }

    const request = {
      input: { text },
      voice: { 
        languageCode: languageCode || 'en-US', 
        name: voiceName || 'en-US-Journey-F' 
      },
      audioConfig: { audioEncoding: 'MP3' },
    };

    console.log(`TTS API: Synthesizing speech via Google Cloud for "${text.substring(0, 30)}..."`);
    const [response] = await ttsClient.synthesizeSpeech(request);
    
    // Save to cache
    ttsCache.set(cacheKey, response.audioContent);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.audioContent);
  } catch (error) {
    console.error('TTS synthesis failed:', error);
    res.status(500).json({ error: error.message || 'TTS synthesis failed' });
  }
});

// TTS GET endpoint for direct progressive audio streaming
app.get('/api/tts', async (req, res) => {
  try {
    const text = req.query.text;
    const voiceName = req.query.voiceName;
    const languageCode = req.query.languageCode;
    
    if (!text) {
      return res.status(400).send('Text is required');
    }

    const cacheKey = `${text}_${voiceName || 'default'}_${languageCode || 'default'}`;
    if (ttsCache.has(cacheKey)) {
      res.setHeader('Content-Type', 'audio/mpeg');
      return res.send(ttsCache.get(cacheKey));
    }

    const request = {
      input: { text },
      voice: { 
        languageCode: languageCode || 'en-US', 
        name: voiceName || 'en-US-Journey-F' 
      },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await ttsClient.synthesizeSpeech(request);
    ttsCache.set(cacheKey, response.audioContent);
    
    res.setHeader('Content-Type', 'audio/mpeg');
    res.send(response.audioContent);
  } catch (error) {
    console.error('TTS GET synthesis failed:', error);
    res.status(500).send('TTS synthesis failed');
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', googleCloudCredentialsConfigured: true });
});

// Helper function to format spaced/spelled-out acronyms back into unified uppercase acronyms
function formatAcronyms(text) {
  if (!text) return text;
  
  let formatted = text;
  
  // Array of regexes mapping spaced letters (like "j p n" or "J P N") to single uppercase acronyms
  const acronyms = [
    { pattern: /\b([jJ]\s+[pP]\s+[nN]|[jJ]\s+[pP]\s+[mM]|japan)\b/gi, replacement: 'JPN' },
    { pattern: /\b([jJ]\s+[pP]\s+[aA]|[jJ]\s+[bB]\s+[aA]|jba)\b/gi, replacement: 'JPA' },
    { pattern: /\b([jJ]\s+[pP]\s+[jJ]|[jJ]\s+[pP]\s+[gG]|jpg|jpeg|jay\s+vijag|jay\s+vijak|jay\s+p\s+jay|jay\s+p\s+g|j\s+p\s+d)\b/gi, replacement: 'JPJ' },
    { pattern: /\b([pP]\s+[dD]\s+[rR]\s+[mM]|pdrm|petty\s+rm|pd\s+rm)\b/gi, replacement: 'PDRM' },
    { pattern: /\b([sS]\s+[pP]\s+[rR]|[sS]\s+[bB]\s+[rR]|sbr)\b/gi, replacement: 'SPR' },
    { pattern: /\b([lL]\s+[hH]\s+[dD]\s+[nN]|[lL]\s+[hH]\s+[dD]\s+[mM]|[lL]\s+[hH]\s+[tT]\s+[nN]|ldhn|lhdn)\b/gi, replacement: 'LHDN' },
    { pattern: /\b([sS]\s+[sS]\s+[mM]|[sS]\s+[sS]\s+[nN]|ssn)\b/gi, replacement: 'SSM' },
    { pattern: /\b([bB]\s+[nN]\s+[mM]|[bB]\s+[nN]\s+[nN]|[vV]\s+[nN]\s+[mM]|vnm)\b/gi, replacement: 'BNM' },
    { pattern: /\b([mM]\s+[oO]\s+[fF]|[mM]\s+[oO]\s+[vV]|mov)\b/gi, replacement: 'MOF' },
    { pattern: /\b([mM]\s+[iI]\s+[dD]\s+[aA]|mida|meeda)\b/gi, replacement: 'MIDA' },
    { pattern: /\b([mM]\s+[dD]\s+[eE]\s+[cC]|mdec|m\s+deck|am\s+deck)\b/gi, replacement: 'MDEC' },
    { pattern: /\b([mM]\s+[aA]\s+[rR]\s+[aA])\b/gi, replacement: 'MARA' },
    { pattern: /\b([tT]\s+[eE]\s+[kK]\s+[uU]\s+[nN]|tacon|teh\s+kun)\b/gi, replacement: 'TEKUN' },
    { pattern: /\b([kK]\s+[wW]\s+[aA]\s+[pP]|kwap|co-op|coop)\b/gi, replacement: 'KWAP' },
    { pattern: /\b([kK]\s+[wW]\s+[sS]\s+[pP]|[kK]\s+[wW]\s+[sS]\s+[bB]|kwsb)\b/gi, replacement: 'KWSP' },
    { pattern: /\b([pP]\s+[eE]\s+[rR]\s+[kK]\s+[eE]\s+[sS]\s+[oO]|perkeso|pagaso|percaso|pekeso|[pP]\s+[eE]\s+[kK]\s+[eE]\s+[sS]\s+[oO])\b/gi, replacement: 'PERKESO' },
    { pattern: /\b([eE]\s+[iI]\s+[sS]|eis)\b/gi, replacement: 'EIS' },
    { pattern: /\b([jJ]\s+[tT]\s+[kK]|[jJ]\s+[tT]\s+[gG]|jtg)\b/gi, replacement: 'JTK' },
    { pattern: /\b([sS]\s+[pP]\s+[aA]|spa|spar)\b/gi, replacement: 'SPA' },
    { pattern: /\b([jJ]\s+[kK]\s+[mM]|[jJ]\s+[kK]\s+[nN]|jkn)\b/gi, replacement: 'JKM' },
    { pattern: /\b([oO]\s+[kK]\s+[uU]|[oO]\s+[kK]\s+[yY]|oky)\b/gi, replacement: 'OKU' },
    { pattern: /\b([sS]\s+[tT]\s+[rR]|[sS]\s+[tT]\s+[aA]|sta)\b/gi, replacement: 'STR' },
    { pattern: /\b([sS]\s+[aA]\s+[rR]\s+[aA])\b/gi, replacement: 'SARA' },
    { pattern: /\b([eE]\s+[kK]\s+[aA]\s+[sS]\s+[iI]\s+[hH]|ekasih|a\s+kasih|e\s+kasy)\b/gi, replacement: 'eKasih' },
    { pattern: /\b([kK]\s+[kK]\s+[mM]|[kK]\s+[kK]\s+[nN]|kkn)\b/gi, replacement: 'KKM' },
    { pattern: /\b([mM]\s+[oO]\s+[hH])\b/gi, replacement: 'MOH' },
    { pattern: /\b([pP]\s+[tT]\s+[pP]\s+[tT]\s+[nN]|[pP]\s+[tT]\s+[pP]\s+[tT]\s+[mM]|ptptm)\b/gi, replacement: 'PTPTN' },
    { pattern: /\b([uU]\s+[pP]\s+[uU])\b/gi, replacement: 'UPU' },
    { pattern: /\b([tT]\s+[vV]\s+[eE]\s+[tT]|tvet|t-vet)\b/gi, replacement: 'TVET' },
    { pattern: /\b([jJ]\s+[iI]\s+[mM]|gym)\b/gi, replacement: 'JIM' },
    { pattern: /\b([mM]\s+[aA]\s+[mM]\s+[pP]\s+[uU]|mampus)\b/gi, replacement: 'MAMPU' },
    { pattern: /\b([sS]\s+[pP]\s+[rR]\s+[mM]|[sS]\s+[pP]\s+[rR]\s+[nN]|sprn)\b/gi, replacement: 'SPRM' }
  ];

  acronyms.forEach(({ pattern, replacement }) => {
    formatted = formatted.replace(pattern, replacement);
  });

  return formatted;
}

// Set up WebSocket server for real-time STT
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws, req) => {
  console.log('STT WS: Client connected');
  
  const url = new URL(req.url, `http://${req.headers.host}`);
  const sampleRate = parseInt(url.searchParams.get('sampleRate')) || 16000;
  const clientLanguage = url.searchParams.get('language') || 'en-US';
  console.log(`STT WS: Configured sample rate: ${sampleRate}Hz, language: ${clientLanguage} (Google Speech V2 Chirp 2 Singapore)`);
  
  let recognizeStream = null;

  const startRecognitionStream = () => {
    try {
      recognizeStream = speechClient._streamingRecognize();
      
      recognizeStream
        .on('error', (err) => {
          // Avoid crashing the server on client speech errors (e.g. timeout)
          console.error('STT WS: Google Speech V2 stream error:', err.message);
          if (err.statusDetails) {
            console.error('STT WS: Error details:', JSON.stringify(err.statusDetails, null, 2));
          }
          ws.send(JSON.stringify({ error: err.message }));
        })
        .on('data', (data) => {
          const result = data.results[0];
          if (result && result.alternatives[0]) {
            const rawTranscript = result.alternatives[0].transcript;
            const transcript = formatAcronyms(rawTranscript);
            const isFinal = result.isFinal;
            ws.send(JSON.stringify({ text: transcript, isFinal }));
          }
        });

      // Write initial configuration for Speech V2 client
      const recognizer = `projects/${projectId}/locations/${location}/recognizers/_`;
      const languageCodes = [clientLanguage === 'bilingual' ? 'en-US' : clientLanguage];
      
      const phrasesToBoost = [
        'JPJ', 'JPN', 'JPA', 'PDRM', 'SPR', 'LHDN', 'SSM', 'BNM', 'MOF', 'MIDA',
        'MDEC', 'MARA', 'TEKUN', 'KWAP', 'KWSP', 'PERKESO', 'EIS', 'JTK', 'SPA',
        'JKM', 'OKU', 'STR', 'SARA', 'eKasih', 'KKM', 'MOH', 'PTPTN', 'UPU',
        'TVET', 'JIM', 'MAMPU', 'SPRM'
      ];

      recognizeStream.write({
        recognizer,
        streamingConfig: {
          config: {
            explicitDecodingConfig: {
              encoding: 'LINEAR16',
              sampleRateHertz: sampleRate,
              audioChannelCount: 1,
            },
            languageCodes: languageCodes,
            model: 'chirp_2',
            adaptation: {
              phraseSets: [
                {
                  inlinePhraseSet: {
                    phrases: phrasesToBoost.map(phrase => ({
                      value: phrase,
                      boost: 15.0
                    }))
                  }
                }
              ]
            }
          },
          streamingFeatures: {
            interimResults: true,
          }
        }
      });
    } catch (err) {
      console.error('STT WS: Failed to start Google Speech V2 stream:', err);
      ws.send(JSON.stringify({ error: 'Failed to initialize Speech V2 recognition' }));
    }
  };

  // Start stream upon connection
  startRecognitionStream();

  ws.on('message', (message, isBinary) => {
    if (isBinary) {
      // In Google Speech V2 API, audio bytes must be wrapped in an object with the 'audio' property
      if (recognizeStream && !recognizeStream.destroyed) {
        recognizeStream.write({ audio: message });
      }
    } else {
      // Text control messages
      try {
        const msg = JSON.parse(message.toString());
        if (msg.event === 'stop') {
          stopRecognitionStream();
        } else if (msg.event === 'start') {
          if (!recognizeStream || recognizeStream.destroyed) {
            startRecognitionStream();
          }
        }
      } catch (err) {
        console.error('STT WS: Error parsing text message:', err);
      }
    }
  });

  const stopRecognitionStream = () => {
    if (recognizeStream) {
      recognizeStream.end();
      recognizeStream = null;
      console.log('STT WS: Recognition stream ended');
    }
  };

  ws.on('close', () => {
    console.log('STT WS: Client disconnected');
    stopRecognitionStream();
  });
});

// Upgrade HTTP server connections to WebSockets on /ws
server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;

  if (pathname === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
