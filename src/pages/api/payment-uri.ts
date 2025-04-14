// pages/api/payment-uri.ts
import type { NextApiRequest, NextApiResponse } from "next";
import bip21 from "bip21";
import QRCode from "qrcode";
import cors from "cors";
import { promises as fs } from "fs";
import path from "path";

// Define request interface with the expected query parameters
interface PaymentUriRequest extends NextApiRequest {
  query: {
    btc?: string;
    ln?: string;
    amt?: string;
    name?: string;
    description?: string;
    format?: string; // 'json', 'png', or 'base64'
  };
}

// Response type
type PaymentUriResponse = {
  uri?: string;
  qrCode?: string; // Base64 encoded QR code image
  error?: string;
};

// Setup CORS middleware
const corsMiddleware = cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Ensure the public directory exists for saving QR codes
const PUBLIC_DIR = path.join(process.cwd(), "public", "qrcodes");

// Create the directory if it doesn't exist (only in development,
// in production you should create this directory during build)
async function ensurePublicDirExists() {
  try {
    await fs.mkdir(PUBLIC_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating directory:", error);
  }
}

export default async function handler(
  req: PaymentUriRequest,
  res: NextApiResponse<PaymentUriResponse | Buffer>
) {
  // Apply CORS middleware
  await runMiddleware(req, res, corsMiddleware);

  // Parse query parameters
  const { btc, ln, amt, name, description, format = "json" } = req.query;

  // Validate required parameters
  if (!btc || !ln) {
    return res.status(400).json({
      error:
        'Missing required parameters. Both "btc" (Bitcoin address) and "ln" (Lightning invoice) are required.',
    });
  }

  try {
    // Prepare BIP21 options
    const options: any = {};

    if (amt) options.amount = amt;
    if (name) options.label = name;
    if (description) options.message = description;

    // Lightning must go last as per the original script
    options.lightning = ln;

    // Generate the BIP21 URI
    const uri = bip21.encode(btc, options);

    // Handle different response formats
    switch (format) {
      case "png": {
        // Generate QR code as PNG
        await ensurePublicDirExists();
        const fileName = `payment-${Date.now()}.png`;
        const filePath = path.join(PUBLIC_DIR, fileName);

        await QRCode.toFile(filePath, uri);

        // Read the file and return it
        const qrBuffer = await fs.readFile(filePath);
        res.setHeader("Content-Type", "image/png");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${fileName}"`
        );
        return res.status(200).send(qrBuffer);
      }

      case "base64": {
        // Generate QR code as base64 string
        const qrBase64 = await QRCode.toDataURL(uri);
        return res.status(200).json({
          uri,
          qrCode: qrBase64,
        });
      }

      case "json":
      default:
        // Return just the URI as JSON
        return res.status(200).json({ uri });
    }
  } catch (error: any) {
    console.error("Error generating payment URI:", error);
    return res.status(500).json({
      error: error.message || "Error generating payment URI",
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
