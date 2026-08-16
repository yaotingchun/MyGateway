/**
 * Client Speech-to-Text & Text-to-Speech Controller for MyGateway
 * Features:
 * - Real-time Google Cloud STT V2 WebSocket streaming
 * - Dual-layer fallback to Browser Web Speech API (webkitSpeechRecognition)
 * - Real-time acronym formatting for Malaysian government agencies
 */

// Acronym dictionary for Malaysian government agencies & services
const ACRONYM_RULES = [
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

export function formatAcronyms(text) {
  if (!text) return text;
  let formatted = text;
  ACRONYM_RULES.forEach(({ pattern, replacement }) => {
    formatted = formatted.replace(pattern, replacement);
  });
  return formatted;
}

let activeRecognition = null;
let activeMediaStream = null;
let activeAudioContext = null;
let activeSocket = null;

/**
 * Start Voice Dictation
 * @param {object} options 
 * @param {function} options.onTranscript - Callback for text (text, isFinal)
 * @param {function} options.onError - Callback for errors
 * @param {function} options.onEnd - Callback when dictation terminates
 * @param {string} options.lang - 'EN' | 'MY'
 */
export async function startDictation({ onTranscript, onError, onEnd, lang = 'EN' }) {
  stopDictation();

  const languageCode = lang === 'MY' ? 'ms-MY' : 'en-US';

  // Strategy 1: Try Web Speech API (Fastest and zero-latency in modern browsers)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = languageCode;

      recognition.onresult = (event) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        const raw = finalText || interimText;
        const formatted = formatAcronyms(raw);
        if (onTranscript && formatted) {
          onTranscript(formatted, !!finalText);
        }
      };

      recognition.onerror = (event) => {
        console.warn('[WebSpeech API Warning]:', event.error);
        if (event.error === 'not-allowed') {
          if (onError) onError('Microphone access was denied. Please allow microphone permissions.');
          stopDictation();
        }
      };

      recognition.onend = () => {
        if (onEnd) onEnd();
      };

      recognition.start();
      activeRecognition = recognition;
      return true;
    } catch (err) {
      console.warn('[WebSpeech API Fallback triggered]:', err.message);
    }
  }

  // Strategy 2: Google Cloud STT V2 WebSocket Stream
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    activeMediaStream = stream;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    activeAudioContext = audioContext;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?sampleRate=16000&language=${languageCode}`;
    const ws = new WebSocket(wsUrl);
    activeSocket = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.text && onTranscript) {
          onTranscript(data.text, !!data.isFinal);
        }
      } catch (e) {
        console.error('[STT WS Message Error]:', e);
      }
    };

    ws.onerror = (e) => {
      console.warn('[STT WS Note]:', e);
    };

    ws.onclose = () => {
      if (onEnd) onEnd();
    };

    ws.onopen = () => {
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to 16-bit PCM Linear
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        ws.send(pcm16.buffer);
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    };

    return true;
  } catch (err) {
    console.error('[Dictation Start Error]:', err);
    if (onError) onError(err.message || 'Unable to access microphone.');
    stopDictation();
    return false;
  }
}

/**
 * Stop any active voice dictation
 */
export function stopDictation() {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch (_) {}
    activeRecognition = null;
  }

  if (activeSocket) {
    try {
      activeSocket.close();
    } catch (_) {}
    activeSocket = null;
  }

  if (activeAudioContext) {
    try {
      activeAudioContext.close();
    } catch (_) {}
    activeAudioContext = null;
  }

  if (activeMediaStream) {
    try {
      activeMediaStream.getTracks().forEach((track) => track.stop());
    } catch (_) {}
    activeMediaStream = null;
  }
}
