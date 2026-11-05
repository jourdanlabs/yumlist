import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, X, Image as ImageIcon } from "lucide-react";

const REGION_ID = "pantry-barcode-region";
const FILE_REGION_ID = "pantry-barcode-file-region";

const FORMATS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.CODABAR,
  Html5QrcodeSupportedFormats.QR_CODE,
];

const SCANNER_OPTIONS = {
  verbose: false,
  // The native BarcodeDetector silently misses many 1D barcodes on Android;
  // the library's own decoder is far more reliable for grocery codes.
  useBarCodeDetectorIfSupported: false,
  formatsToSupport: FORMATS,
};

export default function BarcodeScanner({ onDetected, onClose }) {
  const detectedRef = useRef(onDetected);
  const handledRef = useRef(false);
  const fileInputRef = useRef(null);
  const [attempt, setAttempt] = useState(0);
  const [starting, setStarting] = useState(true);
  const [cameraError, setCameraError] = useState("");
  const [fileError, setFileError] = useState("");
  const [readingFile, setReadingFile] = useState(false);

  useEffect(() => {
    detectedRef.current = onDetected;
  }, [onDetected]);

  const finish = (code) => {
    if (handledRef.current) return;
    handledRef.current = true;
    detectedRef.current?.(code);
  };

  useEffect(() => {
    let active = true;
    setStarting(true);
    setCameraError("");
    const scanner = new Html5Qrcode(REGION_ID, SCANNER_OPTIONS);

    scanner
      .start(
        { facingMode: { ideal: "environment" } },
        {
          fps: 12,
          qrbox: (w, h) => ({
            width: Math.max(50, Math.floor(w * 0.85)),
            height: Math.max(50, Math.floor(h * 0.4)),
          }),
          aspectRatio: 1.777,
          disableFlip: true,
        },
        (decoded) => finish(decoded),
        () => {}
      )
      .then(() => {
        if (active) setStarting(false);
      })
      .catch((e) => {
        if (!active) return;
        const msg = e && typeof e === "string" ? e : (e && e.message) || "";
        setCameraError(
          /permission|denied|notallowed/i.test(msg)
            ? "Camera access is blocked. Allow camera access for this site, or scan a photo of the barcode instead."
            : "Couldn't start the camera on this device. You can scan a photo of the barcode instead."
        );
        setStarting(false);
      });

    return () => {
      active = false;
      try {
        if (scanner.isScanning) scanner.stop().then(() => scanner.clear()).catch(() => {});
        else scanner.clear();
      } catch (err) {
        /* camera never started */
      }
    };
  }, [attempt]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileError("");
    setReadingFile(true);
    try {
      const reader = new Html5Qrcode(FILE_REGION_ID, SCANNER_OPTIONS);
      const result = await reader.scanFile(file, false);
      reader.clear();
      if (result) finish(result);
      else setFileError("No barcode found in that photo. Try again with the barcode filling the frame.");
    } catch (err) {
      setFileError("Couldn't read that photo. Try again with the barcode filling the frame.");
    } finally {
      setReadingFile(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] pointer-events-auto bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 font-medium">
            <Camera className="w-4 h-4" /> Scan barcode
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close scanner">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="relative aspect-[4/3] bg-black">
          <div id={REGION_ID} className="w-full h-full overflow-hidden" />
          {starting && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/80 gap-2">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">Starting camera…</span>
            </div>
          )}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-white/90">{cameraError}</p>
              <Button size="sm" variant="secondary" onClick={() => setAttempt((n) => n + 1)}>
                Try camera again
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          {!cameraError && (
            <p className="text-sm text-muted-foreground text-center">
              Hold the barcode steady in the box and move the phone back a little.
            </p>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={readingFile}
          >
            {readingFile ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ImageIcon className="w-4 h-4 mr-2" />
            )}
            Scan a photo of the barcode
          </Button>

          {fileError && <p className="text-sm text-destructive text-center">{fileError}</p>}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
          />
          <div id={FILE_REGION_ID} className="hidden" />
        </div>
      </div>
    </div>,
    document.body
  );
}