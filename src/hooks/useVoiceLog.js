import { useState, useRef, useCallback, useEffect } from 'react';
import { getSpeechRecognition, isSpeechSupported } from '../utils/voice';

export function useVoiceLog({ onTranscript } = {}) {
  const supported = isSpeechSupported();
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onTranscriptRef = useRef(onTranscript);
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (rec) {
      try { rec.stop(); } catch { /* noop */ }
    }
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      setError('Voice input not supported on this device. Type instead.');
      return;
    }
    try {
      const rec = new Recognition();
      rec.lang = 'en-US';
      rec.interimResults = true;
      rec.continuous = false;
      let finalText = '';
      rec.onresult = (event) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) finalText += result[0].transcript;
          else interimText += result[0].transcript;
        }
        setInterim(interimText);
        if (finalText) {
          setTranscript((prev) => (prev ? prev + ' ' : '') + finalText.trim());
          finalText = '';
        }
      };
      rec.onerror = (e) => {
        setError(e?.error ? `voice: ${e.error}` : 'voice error');
        setListening(false);
      };
      rec.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };
      recognitionRef.current = rec;
      setListening(true);
      rec.start();
    } catch {
      setError('Could not start voice input.');
      setListening(false);
    }
  }, []);

  const clear = useCallback(() => {
    setTranscript('');
    setInterim('');
    setError(null);
  }, []);

  const submit = useCallback(() => {
    const text = transcript.trim();
    if (text && onTranscriptRef.current) onTranscriptRef.current(text);
    clear();
  }, [transcript, clear]);

  return { supported, listening, transcript, interim, error, start, stop, clear, submit, setTranscript };
}
