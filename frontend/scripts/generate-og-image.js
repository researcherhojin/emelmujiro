/**
 * Generate OG image (1200x630) for social media sharing.
 *
 * Uses Playwright to render an HTML template and screenshot it.
 * The template uses the actual brand colors and logo from the project.
 *
 * Usage: node scripts/generate-og-image.js
 *
 * Output: public/og-image.png
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_PATH = path.resolve(__dirname, '../public/og-image.png');
const LOGO_PATH = path.resolve(__dirname, '../public/logo.png');

// Brand colors from tailwind.config.js
const COLORS = {
  primary400: '#60a5fa',
  primary500: '#3b82f6',
  primary600: '#2563eb',
  dark800: '#27272a',
  dark850: '#1f2022',
  dark900: '#18181b',
  dark950: '#0a0a0b',
};

// Read logo as base64 data URI so it can be embedded in the HTML template
const logoBase64 = fs.readFileSync(LOGO_PATH).toString('base64');
const logoDataUri = `data:image/png;base64,${logoBase64}`;

const HTML_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }

    .container {
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, ${COLORS.dark950} 0%, ${COLORS.dark900} 40%, ${COLORS.dark850} 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    /* Subtle gradient orb behind content for depth */
    .container::before {
      content: '';
      position: absolute;
      width: 700px;
      height: 700px;
      border-radius: 50%;
      background: radial-gradient(circle, ${COLORS.primary600}18 0%, transparent 70%);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    /* Top accent line */
    .accent-line {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, ${COLORS.primary500}, ${COLORS.primary400}, ${COLORS.primary500});
    }

    .content {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 28px;
    }

    .logo-wrapper {
      width: 120px;
      height: 120px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
    }

    .logo-wrapper img {
      width: 80px;
      height: 80px;
      object-fit: contain;
    }

    .text-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .site-name {
      font-size: 52px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
      line-height: 1.1;
    }

    .tagline {
      font-size: 24px;
      font-weight: 400;
      color: ${COLORS.primary400};
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    .divider {
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, transparent, ${COLORS.primary400}, transparent);
    }

    .url {
      font-size: 16px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.4);
      letter-spacing: 2px;
    }

    /* Corner decorations */
    .corner {
      position: absolute;
      width: 80px;
      height: 80px;
      border: 2px solid rgba(255, 255, 255, 0.06);
    }
    .corner-tl { top: 32px; left: 32px; border-right: none; border-bottom: none; border-radius: 8px 0 0 0; }
    .corner-tr { top: 32px; right: 32px; border-left: none; border-bottom: none; border-radius: 0 8px 0 0; }
    .corner-bl { bottom: 32px; left: 32px; border-right: none; border-top: none; border-radius: 0 0 0 8px; }
    .corner-br { bottom: 32px; right: 32px; border-left: none; border-top: none; border-radius: 0 0 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="accent-line"></div>
    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <div class="content">
      <div class="logo-wrapper">
        <img src="${logoDataUri}" alt="Emelmujiro Logo" />
      </div>
      <div class="text-group">
        <div class="site-name">에멜무지로</div>
        <div class="tagline">AI Education & Consulting</div>
      </div>
      <div class="divider"></div>
      <div class="url">emelmujiro.com</div>
    </div>
  </div>
</body>
</html>
`;

async function generateOgImage() {
  console.log('Generating OG image (1200x630)...');

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });

  await page.setContent(HTML_TEMPLATE, { waitUntil: 'networkidle' });

  // Wait for fonts to load
  await page.waitForFunction(() => document.fonts.ready);
  // Extra wait to ensure font rendering is complete
  await page.waitForTimeout(500);

  await page.screenshot({
    path: OUTPUT_PATH,
    type: 'png',
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  });

  await browser.close();

  const stats = fs.statSync(OUTPUT_PATH);
  const sizeKB = (stats.size / 1024).toFixed(1);
  console.log(`OG image generated: ${OUTPUT_PATH} (${sizeKB} KB)`);
}

generateOgImage().catch((err) => {
  console.error('Failed to generate OG image:', err);
  process.exit(1);
});
