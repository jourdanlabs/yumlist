import React from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";
import { cn } from "@/lib/utils";

/**
 * A small mic button that appends transcribed speech to a text field.
 * Usage: <VoiceButton onTranscript={(text) => setForm(f => ({ ...f, name: text }))} />
 */
export default function VoiceButton({ onTranscript, className }) {
  const { supported, listening, start, stop } = useSpeechToText({ onResult: onTranscript });

  if (!supported) return null;

  const handleClick = () => (listening ? stop() : start());

  return (
    <button
      type="button"
      onClick={handleClick}
      title={listening ? "Stop voice input" : "Speak to enter text"}
      className={cn(
        "flex-shrink-0 inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background hover:bg-accent transition-colors",
        listening && "border-red-400 bg-red-50 text-red-600",
        className
      )}
    >
      {listening ? <Loader2 className="w-4 h-4 animate-spin" /> : supported ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}