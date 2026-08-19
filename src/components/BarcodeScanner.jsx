import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, X } from "lucide-react";

export default function BarcodeScanner({ onDetected, onClose }) {
  const scannerRef = useRef(null);
  const html5Ref = useRef(null);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);

  useEffect(() => {
    let active = true;
    const start = async () => {
      try {
        const html5 = new Html5Qrcode("pantry-barcode-region");
        html5Ref.current = html5;
        await html5.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 150 }, formats: ["EAN_13", "EAN_8", "UPC_A", "UPC_E", "CODE_128"] },
          (decoded) => {
            if (!active) return;
            active = false;
            onDetected(decoded);
          },
          () => {}
        );
        if (active) setStarting(false);
      } catch (e) {
        setError(e && e.message ? e.message : "Could not access camera");
        setStarting(false);
      }
    };
    start();
    return () => {
      active = false;
      const html5 = html5Ref.current;
      if (html5) {
        html5.stop().then(() => html5.clear()).catch(() => {});
      }
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
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
          <div id="pantry-barcode-region" ref={scannerRef} className="w-full h-full" />
          {starting && (
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
          Point the camera at a product barcode.
        </div>
      </div>
    </div>
  );
}