import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Browser-based speech-to-text via the Web Speech API.
 * No packages required. Falls back gracefully when unsupported.
 */
export function useSpeechToText({ onResult, lang = "en-US", continuous = false } = {}) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const recognition = new SR();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join(" ");
      if (onResultRef.current) onResultRef.current(text.trim());
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;

    return () => {
      try { recognition.abort(); } catch (e) {}
      recognitionRef.current = null;
    };
  }, [lang, continuous]);

  const start = useCallback(() => {
    if (!recognitionRef.current || listening) return;
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (e) {
      setListening(false);
    }
  }, [listening]);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch (e) {}
    setListening(false);
  }, []);

  return { supported, listening, start, stop };
}