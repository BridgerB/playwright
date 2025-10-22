# Firebase Functions - Screenshot Service

This directory contains Firebase Cloud Functions for taking screenshots of
websites using Puppeteer.

## Functions

### `screenshot`

Takes a screenshot of a given URL and returns it as a base64-encoded data URL.

**Endpoint:**
`https://us-central1-playwright-bridgerb-com.cloudfunctions.net/screenshot`

**Method:** POST

**Request Body:**

```json
{
  "url": "https://example.com"
}
```

**Response:**

```json
{
  "screenshot": "data:image/png;base64,iVBORw0KG..."
}
```

**Error Response:**

```json
{
  "error": "Error message"
}
```

## Configuration

- **Memory:** 1GiB (required for browser automation)
- **Runtime:** Node.js 22
- **Browser:** Chrome (installed via Puppeteer during deployment)

## Local Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run emulator
npm run serve

# Deploy to Firebase
npm run deploy
```

## Testing

Test the deployed function:

```bash
curl -X POST https://us-central1-playwright-bridgerb-com.cloudfunctions.net/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://bridgerb.com"}'
```

Or run the test script:

```bash
npx tsx ../test/screenshot.ts
```

## How It Works

1. **Deployment:** When deployed, the `postinstall` script runs
   `npx puppeteer browsers install chrome`, downloading Chrome to
   `functions/.cache/puppeteer`
2. **Configuration:** `.puppeteerrc.cjs` configures Puppeteer to use the local
   cache directory
3. **Runtime:** The function launches Chrome with `--no-sandbox` and
   `--disable-setuid-sandbox` flags (required for Cloud Functions)
4. **Screenshot:** Navigates to the URL, waits 2 seconds for rendering, takes a
   PNG screenshot, and returns it as base64

## Notes

- Chrome is bundled with the function deployment (~150MB)
- Screenshots are PNG format, viewport size (not full page by default)
- 30-second navigation timeout
- Waits for `domcontentloaded` event before taking screenshot
