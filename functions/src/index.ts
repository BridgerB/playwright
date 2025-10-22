/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as puppeteer from "puppeteer";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const screenshot = onRequest(
  { memory: "1GiB" },
  async (request, response) => {
    let browser;

    try {
      const { url } = request.body;

      // Validate URL
      if (!url) {
        response.status(400).json({ error: "URL is required" });
        return;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (e) {
        response.status(400).json({ error: "Invalid URL format" });
        return;
      }

      // Launch browser
      browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true,
      });

      const page = await browser.newPage();

      // Navigate to URL with timeout
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Wait a bit for page to render
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Take screenshot
      const screenshotBuffer = await page.screenshot({
        type: "png",
        fullPage: false,
      });

      // Convert to base64
      const base64 = screenshotBuffer.toString("base64");
      const dataUrl = `data:image/png;base64,${base64}`;

      await browser.close();

      logger.info("Screenshot generated successfully");
      response.status(200).json({ screenshot: dataUrl });
    } catch (error) {
      if (browser) {
        await browser.close();
      }

      logger.error("Screenshot error:", error);

      response.status(500).json({
        error: error instanceof Error
          ? error.message
          : "Failed to take screenshot",
      });
    }
  },
);
