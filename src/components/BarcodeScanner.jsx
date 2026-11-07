import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, X, Image as ImageIcon, ScanLine } from "lucide-react";

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

const NATIVE_NAMES = {
  [Html5QrcodeSupportedFormats.QR_CODE]: "qr_code",
  [Html5QrcodeSupportedFormats.AZTEC]: "aztec",
  [Html5QrcodeSupportedFormats.CODABAR]: "codabar",
  [Html5QrcodeSupportedFormats.CODE_39]: "code_39",
  [Html5QrcodeSupportedFormats.CODE_93]: "code_93",
  [Html5QrcodeSupportedFormats.CODE_128]: "code_128",
  [Html5QrcodeSupportedFormats.DATA_MATRIX]: "data_matrix",
  [Html5QrcodeSupportedFormats.ITF]: "itf",
  [Html5QrcodeSupportedFormats.EAN_13]: "ean_13",
  [Html5QrcodeSupportedFormats.EAN_8]: "ean_8",
  [Html5QrcodeSupportedFormats.PDF_417]: "pdf417",
  [Html5QrcodeSupportedFormats.UPC_A]: "upc_a",
  [Html5QrcodeSupportedFormats.UPC_E]: "upc_e",
};

// A still photo is decoded by the device's own scanner (Apple's Vision engine behind
// Safari's BarcodeDetector, Google Play Services behind Chrome), with the bundled JS
// decoder as fallback. The native detector throws on formats it doesn't know, so it only
// gets the ones this browser reports supporting.
let formatsPromise = null;
const resolveFormats = () => {
  if (!formatsPromise) {
    formatsPromise = (async () => {
      const detector = window.BarcodeDetector;
      if (!detector?.getSupportedFormats) return { formats: FORMATS, native: false };
      try {
        const supported = await detector.getSupportedFormats();
        const filtered = FORMATS.filter((f) => supported.includes(NATIVE_NAMES[f]));
        return filtered.length ? { formats: filtered, native: true } : { formats: FORMATS, native: false };
      } catch (err) {
        return { formats: FORMATS, native: false };
      }
    })();
  }
  return formatsPromise;
};

const buildOptions = ({ formats, native }) => ({
  verbose: false,
  useBarCodeDetectorIfSupported: native,
  formatsToSupport: formats,
});

export default function BarcodeScanner({ onDetected, onClose }) {
  const detectedRef = useRef(onDetected);
  const handledRef = useRef(false);
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState("photo");
  const [attempt, setAttempt] = useState(0);
  const [starting, setStarting] = useState(false);
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

  const releaseCamera = (scanner) => {
    try {
      if (scanner.isScanning) scanner.stop().then(() => scanner.clear()).catch(() => {});
      else scanner.clear();
    } catch (err) {
      /* camera never started */
    }
    // Safety net for mobile WebViews where stop() can never resolve: make sure no
    // video track keeps holding the camera once the scanner is closed.
    setTimeout(() => {
      document.querySelectorAll(`#${REGION_ID} video`).forEach((v) => {
        const stream = v.srcObject;
        if (stream && stream.getTracks) stream.getTracks().forEach((t) => t.stop());
      });
    }, 500);
  };

  useEffect(() => {
    if (mode !== "live") return;
    let active = true;
    let started = false;
    let scanner = null;
    let timer = null;
    setStarting(true);
    setCameraError("");

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "This browser can't open the live camera here. Take a photo of the barcode instead."
      );
      setStarting(false);
      return;
    }

    (async () => {
      const resolved = await resolveFormats();
      if (!active) return;
      scanner = new Html5Qrcode(REGION_ID, buildOptions(resolved));

      timer = setTimeout(() => {
        if (!active || started) return;
        setStarting(false);
        setCameraError(
          "The camera didn't start. Check camera permission for this app, or take a photo of the barcode instead."
        );
        releaseCamera(scanner);
      }, 15000);

      scanner
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (w, h) => ({
              width: Math.max(50, Math.floor(w * 0.85)),
              height: Math.max(50, Math.floor(h * 0.45)),
            }),
            disableFlip: true,
            // iPhone opens a low-resolution stream by default, which never resolves
            // 1D grocery barcodes. This must be passed here (not as the camera arg).
            videoConstraints: {
              facingMode: { ideal: "environment" },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
          (decoded) => finish(decoded),
          () => {}
        )
        .then(() => {
          started = true;
          clearTimeout(timer);
          if (active) setStarting(false);
          else releaseCamera(scanner);
          // iPhones usually need a little zoom to sharpen a barcode close up.
          try {
            const caps = scanner.getRunningTrackCapabilities?.() || {};
            const zoom = caps.zoom?.max > 2 ? Math.min(caps.zoom.max, 2) : null;
            const advanced = [];
            if (zoom) advanced.push({ zoom });
            if (caps.focusDistance) advanced.push({ focusDistance: 1 });
            if (advanced.length) scanner.applyVideoConstraints({ advanced }).catch(() => {});
          } catch (err) {
            /* device doesn't expose these capabilities */
          }
        })
        .catch((e) => {
          clearTimeout(timer);
          if (!active) return;
          const msg = e && typeof e === "string" ? e : (e && e.message) || "";
          setCameraError(
            /permission|denied|notallowed/i.test(msg)
              ? "Camera access is blocked. Allow camera access for this site, or take a photo of the barcode instead."
              : "Couldn't start the live camera on this device. Take a photo of the barcode instead."
          );
          setStarting(false);
          releaseCamera(scanner);
        });
    })();

    return () => {
      active = false;
      clearTimeout(timer);
      if (scanner) releaseCamera(scanner);
    };
  }, [attempt, mode]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileError("");
    setReadingFile(true);
    try {
      const resolved = await resolveFormats();
      const reader = new Html5Qrcode(FILE_REGION_ID, buildOptions(resolved));
      const result = await reader.scanFile(file, false);
      reader.clear();
      if (result) finish(result);
      else setFileError("No barcode found in that photo. Get the barcode large and sharp, then try again.");
    } catch (err) {
      setFileError("Couldn't read that photo. Get the barcode large and sharp, then try again.");
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

        {mode === "photo" ? (
          <div className="p-5 space-y-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Take a photo of the barcode</p>
              <p className="text-sm text-muted-foreground">
                Your phone's camera reads the barcode most reliably. Tap below, fill the frame with
                the barcode, and hold steady.
              </p>
            </div>

            <Button
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={readingFile}
            >
              {readingFile ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              {readingFile ? "Reading barcode…" : "Take photo of barcode"}
            </Button>

            {fileError && <p className="text-sm text-destructive text-center">{fileError}</p>}

            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => {
                setFileError("");
                setMode("live");
              }}
            >
              <ScanLine className="w-4 h-4 mr-2" />
              Use the live scanner instead
            </Button>
          </div>
        ) : (
          <>
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
                onClick={() => {
                  setCameraError("");
                  setMode("photo");
                }}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Back to taking a photo
              </Button>
            </div>
          </>
        )}

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
    </div>,
    document.body
  );
}