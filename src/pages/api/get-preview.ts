import type { NextApiRequest, NextApiResponse } from "next";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url } = req.body;

    // Validate email
    if (!url || typeof url !== "string") {
      return res
        .status(400)
        .json({ status: "failure", error: "Invalid email" });
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "load", timeout: 0 });

    // Take screenshot
    console.log(process.cwd(), "process.cwd()");

    const screenshotDir = path.join(
      process.cwd(), // Root directory
      "src", // Enter the src folder
      "Assets", // Then enter the assets folder
      "Images" // Then enter the images folder
    );

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const screenshotPath = path.join(
      __dirname,
      "../../Assets/Images",
      "screenshot.png"
    );
    // const screenshotPath = path.join(screenshotDir, "screenshot.png");

    console.log("screenshotPath", screenshotPath);
    await page.screenshot({ path: screenshotPath });

    await browser.close();

    res.status(200).json({ screenshot: "/screenshot.png" });
  } catch (error) {
    console.error("Error adding user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "3mb",
    },
  },
};
