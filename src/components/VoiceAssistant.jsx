import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2, ArrowLeft, RefreshCw, Trash2, HelpCircle } from 'lucide-react';
import Navbar from './Navbar';
import './VoiceAssistant.css';

const PRESETS = {
  en: [
    "Welcome to My Gateway! How can I assist you with your government services today?",
    "I want to renew my driving licence online.",
    "How do I apply for housing assistance or check my registration status?",
    "Congratulations on your newborn baby! Please register the birth within sixty days.",
    "Your business license application requires an additional spouse income statement."
  ],
  ms: [
    "Selamat datang ke My Gateway! Bagaimanakah saya boleh membantu anda hari ini?",
    "Saya ingin memperbaharui lesen memandu saya secara dalam talian.",
    "Bagaimanakah cara untuk memohon bantuan perumahan atau menyemak status pendaftaran saya?",
    "Tahniah atas kelahiran bayi baru anda! Sila daftarkan kelahiran dalam tempoh enam puluh hari.",
    "Permohonan lesen perniagaan anda memerlukan penyata pendapatan pasangan tambahan."
  ]
};

const detectLanguage = (txt) => {
  if (!txt) return 'en';
  const malayWords = [
    'saya', 'dan', 'yang', 'ini', 'itu', 'untuk', 'di', 'ke', 'ada', 'tidak', 'boleh', 'akan', 
    'dengan', 'pada', 'sebagai', 'kami', 'kita', 'anda', 'mereka', 'dia', 'ia', 'dalam', 'secara',
    'oleh', 'dari', 'telah', 'bagi', 'atau', 'bahawa', 'adalah', 'talian', 'bantuan', 'lesen', 'memandu',
    'permohonan', 'bayi', 'pendaftaran', 'kelahiran', 'kerajaan', 'perkhidmatan', 'tahniah', 'baru',
    'selamat', 'datang', 'bagaimanakah', 'membantu', 'hari', 'ingin', 'memperbaharui', 'secara',
    'cara', 'memohon', 'menyemak', 'status', 'atas', 'kelahiran', 'tempoh', 'enam', 'puluh', 'perniagaan',
    'pasangan', 'tambahan', 'penyata'
  ];
  const lower = txt.toLowerCase();
  for (const word of malayWords) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lower)) {
      return 'ms';
    }
  }
  return 'en';
};

const VoiceAssistant = ({ username, onLogout, onChangePage }) => {
  const [text, setText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // en, ms
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [sttStatus, setSttStatus] = useState('idle'); // idle, listening, processing
  
  // Audio refs
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const wsRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);

  // Stop everything when leaving the page
  useEffect(() => {
    return () => {
      stopSpeech();
      stopRecording();
    };
  }, []);

  const getPresetPhrases = () => {
    return PRESETS[selectedLanguage] || PRESETS.en;
  };

  // ── Speech-to-Text (STT) Logic ──────────────────────────────────────────────
  const startRecording = async () => {
    try {
      setSttStatus('listening');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContextClass({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const sampleRate = audioContext.sampleRate;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const langParam = selectedLanguage === 'en' ? 'en-US' : 'ms-MY';
      const wsUrl = `${protocol}//${window.location.host}/ws?sampleRate=${sampleRate}&language=${langParam}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('STT WS: Connection opened');
        ws.send(JSON.stringify({ event: 'start' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.text) {
            // Append transcribed text to text area
            setText(data.text);
          }
          if (data.error) {
            console.error('STT WS: Error message:', data.error);
          }
        } catch (e) {
          console.error('STT WS: Failed to parse message:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('STT WS: Error:', err);
      };

      ws.onclose = () => {
        console.log('STT WS: Connection closed');
        setIsRecording(false);
        setSttStatus('idle');
      };

      await audioContext.audioWorklet.addModule('/pcm-processor.js');

      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');
      processorRef.current = workletNode;

      workletNode.port.onmessage = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(e.data);
        }
      };

      source.connect(workletNode);
      workletNode.connect(audioContext.destination);

      setIsRecording(true);
    } catch (err) {
      console.error('STT: Failed to start recording:', err);
      alert('Error accessing microphone or initializing real-time STT. Please verify permissions.');
      stopRecording();
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setSttStatus('processing');

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ event: 'stop' }));
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    setTimeout(() => {
      setSttStatus('idle');
    }, 500);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // ── Text-to-Speech (TTS) Logic ──────────────────────────────────────────────
  const speakText = (phraseToSpeak, id = 'tts-test') => {
    if (!phraseToSpeak || !phraseToSpeak.trim()) return;

    if (isPlaying && playingId === id) {
      stopSpeech();
      return;
    }

    stopSpeech();
    setPlayingId(id);
    setIsPlaying(true);

    let langCode = 'en-US';
    let voice = 'en-US-Journey-F';

    if (selectedLanguage === 'ms') {
      langCode = 'ms-MY';
      voice = 'ms-MY-Wavenet-A';
    }

    // Call the GET endpoint directly using Audio src. This bypasses client-side fetch() and blob creation,
    // allowing the browser to stream and play the audio instantly as bytes arrive.
    const url = `/api/tts?text=${encodeURIComponent(phraseToSpeak)}&languageCode=${langCode}&voiceName=${voice}&t=${Date.now()}`;
    const audio = new Audio(url);
    audioRef.current = audio;

    audio.onended = () => {
      setIsPlaying(false);
      setPlayingId(null);
    };

    audio.onerror = (e) => {
      console.error('TTS Audio: Playback error:', e);
      setIsPlaying(false);
      setPlayingId(null);
    };

    audio.play().catch((err) => {
      console.error('TTS Audio: Failed to play audio:', err);
      setIsPlaying(false);
      setPlayingId(null);
    });
  };

  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setPlayingId(null);
  };

  return (
    <div className="va-root">
      <Navbar username={username} onLogout={onLogout} activePage="voice" onChangePage={onChangePage} />

      <main className="va-main">
        {/* Back Link */}
        <button className="va-back-btn" onClick={() => onChangePage('home')}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        {/* Central Core Card */}
        <section className="va-panel">
          <div className="va-glass-card">
            
            {/* Header branding */}
            <div className="va-card-header">
              <div className="va-sparkle-badge">
                <HelpCircle size={16} className="va-sparkle-icon" />
                <span>Speech Gateway Testing</span>
              </div>
              <h1 className="va-card-title">STT & TTS Playground</h1>
              <p className="va-card-sub">Directly test real-time Speech-to-Text transcription and zero-latency Text-to-Speech playback.</p>
            </div>

            {/* Test Area */}
            <div className="va-core-area">
              
              {/* Language Selector */}
              <div className="va-language-selector-container">
                <label className="va-label">Target Language Preference</label>
                <div className="va-language-selector">
                  <button 
                    className={`va-lang-btn ${selectedLanguage === 'en' ? 'active' : ''}`}
                    onClick={() => setSelectedLanguage('en')}
                    title="English Mode (STT: English, TTS: English)"
                  >
                    <span className="va-flag">🇺🇸</span> English
                  </button>
                  <button 
                    className={`va-lang-btn ${selectedLanguage === 'ms' ? 'active' : ''}`}
                    onClick={() => setSelectedLanguage('ms')}
                    title="Malay Mode (STT: Malay, TTS: Malay)"
                  >
                    <span className="va-flag">🇲🇾</span> Bahasa Melayu
                  </button>
                </div>
              </div>
              
              {/* STT Input Block */}
              <div className="va-visualizer-box-wrapper">
                <div className={`va-visualizer-box ${isRecording ? 'active' : ''} ${isPlaying ? 'speaking' : ''}`}>
                  <div className="va-outer-ring">
                    <div className="va-inner-ring">
                      <button 
                        className={`va-mic-trigger ${isRecording ? 'recording' : ''}`}
                        onClick={toggleRecording}
                        title={isRecording ? 'Stop speech recognition' : 'Start Speech-to-Text'}
                      >
                        {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
                      </button>
                    </div>
                  </div>

                  {/* Animated Waveform */}
                  <div className="va-waveform">
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="va-status-text">
                  {sttStatus === 'listening' && <span className="va-pulse-dot red">● Dictation Active (Speak now)</span>}
                  {sttStatus === 'processing' && <span className="va-pulse-dot yellow">● Finalizing transcript...</span>}
                  {sttStatus === 'idle' && !isRecording && !isPlaying && <span className="va-pulse-dot green">● STT Ready</span>}
                  {isPlaying && <span className="va-pulse-dot blue">● Speaking text (TTS Active)</span>}
                </div>
              </div>

              {/* Central Text Area Panel */}
              <div className="va-transcript-wrapper">
                <div className="va-label-row">
                  <label className="va-label">Test Speech Box</label>
                  <div className="va-label-actions">
                    {text && (
                      <button className="va-action-icon-btn red" onClick={() => { setText(''); stopSpeech(); }} title="Clear Text">
                        <Trash2 size={15} /> Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="va-playground-input-wrap">
                  <textarea 
                    className="va-playground-textarea"
                    placeholder="Speak using the microphone above, type some text here, or click one of the presets below to begin testing..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>

                {/* Direct Control Buttons */}
                <div className="va-control-actions">
                  <button 
                    className={`va-play-trigger-btn ${isPlaying && playingId === 'tts-test' ? 'active' : ''}`}
                    onClick={() => speakText(text, 'tts-test')}
                    disabled={!text.trim() || isRecording}
                    title="Speak current text"
                  >
                    {isPlaying && playingId === 'tts-test' ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    <span>{isPlaying && playingId === 'tts-test' ? 'Stop Speech' : 'Synthesize Text (TTS)'}</span>
                  </button>
                </div>
              </div>

              {/* Predefined Test Phrases (Presets) */}
              <div className="va-presets-container">
                <label className="va-label">Click a Preset to Test Instantly</label>
                <div className="va-presets-grid">
                  {getPresetPhrases().map((phrase, idx) => (
                    <div key={idx} className="va-preset-row">
                      <button 
                        className="va-preset-text-btn"
                        onClick={() => setText(phrase)}
                        title="Load phrase into test box"
                      >
                        {phrase}
                      </button>
                      <button 
                        className={`va-preset-speak-btn ${playingId === `preset-${idx}` ? 'active' : ''}`}
                        onClick={() => speakText(phrase, `preset-${idx}`)}
                        title="Speak phrase directly"
                      >
                        {playingId === `preset-${idx}` ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

      </main>

      <footer className="va-footer">
        <p>© 2026 MyGateway — Optimized Google Cloud TTS & STT Sandbox</p>
      </footer>
    </div>
  );
};

export default VoiceAssistant;
