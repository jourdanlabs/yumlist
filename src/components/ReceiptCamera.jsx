import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Camera, X, Loader2, ScanLine } from "lucide-react";

export default function ReceiptCamera({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(() => {
    let active = true;

    const start = async () => {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setError("This browser can't open the camera here. Choose a photo from your device instead.");
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setReady(true);
      } catch (e) {
        const msg = e?.message || "";
        setError(
          /permission|denied|notallowed/i.test(msg)
            ? "Camera access is blocked. Allow camera access for this site, or choose a photo instead."
            : "Couldn't open the camera on this device. Choose a photo instead."
        );
      }
    };

    start();

    return () => {
      active = false;
      stopStream();
    };
  }, []);

  const capture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth || busy) return;
    setBusy(true);
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setBusy(false);
          return;
        }
        const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: "image/jpeg" });
        stopStream();
        onCapture(file);
      },
      "image/jpeg",
      0.92
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <div className="flex items-center gap-2 font-medium">
          <ScanLine className="w-4 h-4" /> Scan receipt
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close camera" className="text-white hover:bg-white/10">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted autoPlay />
        <div className="absolute inset-6 border-2 border-white/70 rounded-xl pointer-events-none" />

        {!ready && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Starting camera…</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-sm text-white/90">{error}</p>
            <Button size="sm" variant="secondary" onClick={onClose}>
              Choose a photo instead
            </Button>
          </div>
        )}
      </div>

      <div className="px-4 py-5 flex flex-col items-center gap-3">
        {!error && (
          <p className="text-xs text-white/70 text-center">Fit the whole receipt inside the frame, then tap the button.</p>
        )}
        <Button
          onClick={capture}
          disabled={!ready || busy}
          className="h-16 w-16 rounded-full bg-white text-black hover:bg-white/90"
          aria-label="Capture receipt"
        >
          {busy ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
        </Button>
      </div>
    </div>,
    document.body
  );
}