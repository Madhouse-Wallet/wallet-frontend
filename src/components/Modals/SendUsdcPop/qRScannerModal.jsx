import React, { useEffect, useRef } from "react";

const QRScannerModal = ({ onScan, openCam, setOpenCam }) => {
  const sdkRef = useRef(null);
  const scannerRef = useRef(null);
  const isScanning = useRef(false);

  const stopScanner = async () => {
    try {
      if (scannerRef.current && isScanning.current) {
        await scannerRef.current.dispose();
        scannerRef.current = null;
        isScanning.current = false;
      }
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }
  };

  const startScanner = async () => {
    try {
      if (scannerRef.current || isScanning.current) {
        return;
      }

      // Initialize SDK if not already done
      if (!sdkRef.current) {
        const reference = (await import("scanbot-web-sdk")).default;
        sdkRef.current = await reference.initialize({
          licenseKey: "", // Leave empty for trial mode
          enginePath: "/wasm/", // Make sure WASM files are in public/wasm folder
        });
      }

      // Create barcode scanner
      const barcodeScanner = await sdkRef.current.createBarcodeScanner({
        containerId: "qr-reader",
        onBarcodesDetected: async (result) => {
          if (result.barcodes && result.barcodes.length > 0) {
            const decodedText = result.barcodes[0].text;
            await stopScanner();
            onScan(decodedText);
            setOpenCam(false);
          }
        },
        onError: (error) => {
          if (!error?.message?.includes("No barcode found")) {
            console.warn("QR Scan Error:", error);
          }
        },
        preferredCamera: "camera2 0",
        style: {
          window: {
            width: "100%",
            height: "100%",
          },
        },
      });

      scannerRef.current = barcodeScanner;
      isScanning.current = true;
    } catch (err) {
      console.error("Failed to start scanner:", err);
      await stopScanner();
      setOpenCam(false);
    }
  };

  useEffect(() => {
    if (openCam) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [openCam]);

  if (!openCam) return null;

  return (
    <div className="fixed inset-0 z-[100000] bg-black">
      <div className="flex flex-col items-center justify-center h-full">
        <div
          id="qr-reader"
          className="w-full h-full bg-black"
          style={{
            maxWidth: "100vw",
            maxHeight: "100vh",
          }}
        />
        <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center">
          <p className="text-sm text-white text-center mb-4">
            Place the QR code in front of your camera
          </p>
          <button
            onClick={async () => {
              await stopScanner();
              setOpenCam(false);
            }}
            className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            Cancel Scan
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScannerModal;
