import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

const QRScannerModal = ({ onScan, openCam, setOpenCam }) => {
  // Use ref to maintain scanner instance
  const scannerRef = useRef(null);
  const isScanning = useRef(false);

  const stopScanner = async () => {
    try {
      if (scannerRef.current && isScanning.current) {
        await scannerRef.current.stop();
        scannerRef.current = null;
        isScanning.current = false;
      }
    } catch (err) {
      console.error("Error stopping scanner:", err);
    }
  };

  const startScanner = async () => {
    try {
      // If scanner already exists or is scanning, return
      if (scannerRef.current || isScanning.current) {
        return;
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      console.log("Starting scanner...");
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          // qrbox: { width: 280, height: 200 },
          qrbox: { width: 350, height: 250 },
        },
        async (decodedText) => {
          console.log("QR Code detected:", decodedText);
          await stopScanner();
          onScan(decodedText);
          setOpenCam(false);
        },
        (error) => {
          if (!error?.message?.includes("No QR code found")) {
            console.warn("QR Scan Error:", error);
          }
        }
      );

      isScanning.current = true;
      console.log("Scanner started successfully");
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

    // Cleanup on unmount
    return () => {
      stopScanner();
    };
  }, [openCam]);

  if (!openCam) return null;

  return (
    <div className="relative w-full">
      <div className="flex flex-col items-center">
        <div
          id="qr-reader"
          className="w-full aspect-square bg-black"
          // style={{ maxWidth: "500px" }}
          style={{
            maxWidth: "350px",
            height: "250px",
          }}
        />
        <p className="text-sm text-white text-center mt-4">
          Place the QR code in front of your camera
        </p>
        <button
          onClick={async () => {
            await stopScanner();
            setOpenCam(false);
          }}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
        >
          Cancel Scan
        </button>
      </div>
    </div>
  );
};

export default QRScannerModal;
