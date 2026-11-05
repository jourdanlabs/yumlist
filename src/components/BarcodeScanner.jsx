import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, X } from "lucide-react";

const REGION_ID = "pantry-barcode-region";

export default function BarcodeScanner({ onDetected, onClose }) {
  const html5Ref = useRef(null);
  const detectedRef = useRef(onDetected);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);

  // Keep the latest callback without restarting the camera on every re-render.
  useEffect(() => {
    detectedRef.current = onDetected;
  }, [onDetected]);

  useEffect(() => {
    let active = true;
    const html5 = new Html5Qrcode(REGION_ID, { useBarCodeDetectorIfSupported: true });
    html5Ref.current = html5;

    html5
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 160 } },
        (decoded) => {
          if (!active) return;
          active = false;
          detectedRef.current?.(decoded);
        },
        () => {}
      )
      .then(() => {
        if (active) setStarting(false);
      })
      .catch((e) => {
        if (!active) return;
        setError(
          e && typeof e === "string"
            ? e
            : (e && e.message) || "Could not access the camera. Check camera permissions for this site."
        );
        setStarting(false);
      });

    return () => {
      active = false;
      const instance = html5Ref.current;
      if (!instance) return;
      instance
        .stop()
        .then(() => instance.clear())
        .catch(() => {});
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-auto bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 font-medium">
            <Camera className="w-4 h-4" /> Scan barcode
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative aspect-[4/3] bg-black">
          <div id={REGION_ID} className="w-full h-full overflow-hidden" />
          {starting && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">Starting camera…</span>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-destructive-foreground bg-destructive/90">
              {error}
            </div>
          )}
        </div>
        <div className="p-4 text-sm text-muted-foreground text-center">
          Hold the barcode steady in the box and move the phone back a little.
        </div>
      </div>
    </div>,
    document.body
  );
}