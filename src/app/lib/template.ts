/**
 * HTML Template Generator for Gift Guide PDF
 * Generates a professional, print-optimized multi-page HTML document
 */

import type { TemplateData, Product } from '../types';

// Default products for the gift guide
const DEFAULT_PRODUCTS: Product[] = [
  {
    name: 'Custom T-Shirt',
    price: 'Starting at $18.99',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
  },
  {
    name: 'Branded Mug',
    price: 'Starting at $12.99',
    imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=300&fit=crop',
  },
  {
    name: 'Custom Tote Bag',
    price: 'Starting at $15.99',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=300&fit=crop',
  },
  {
    name: 'Sticker Pack',
    price: 'Starting at $8.99',
    imageUrl: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop',
  },
];

/**
 * Generates the complete HTML template for the gift guide PDF
 * @param data - Template data including company info, logo, colors, and AE info
 * @returns Complete HTML string ready for Puppeteer rendering
 */
export function generateGiftGuideTemplate(data: TemplateData): string {
  const { companyName, logoUrl, colors, accountExecutive } = data;
  const { primary, secondary, background } = colors;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Gift Guide - ${escapeHtml(companyName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    /* CSS Custom Properties for Brand Colors */
    :root {
      --primary-color: ${primary};
      --secondary-color: ${secondary};
      --background-color: ${background};
      --text-dark: #1a1a1a;
      --text-gray: #666666;
      --text-light: #999999;
    }

    /* Reset and Base Styles */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: var(--text-dark);
      background-color: white;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Page Structure for Print */
    .page {
      width: 8.5in;
      height: 11in;
      padding: 0.75in;
      background-color: white;
      page-break-after: always;
      position: relative;
      overflow: hidden;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* Header Styles */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 20px;
      margin-bottom: 40px;
      border-bottom: 3px solid var(--primary-color);
    }

    .header-logo {
      max-width: 180px;
      max-height: 70px;
      object-fit: contain;
    }

    .header-ae-info {
      text-align: right;
    }

    .ae-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 4px;
    }

    .ae-contact {
      font-size: 12px;
      color: var(--text-gray);
      line-height: 1.6;
    }

    /* Cover Page Styles */
    .cover-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: calc(100% - 150px);
      text-align: center;
      margin-top: 100px;
    }

    .cover-title {
      font-size: 48px;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 16px;
      letter-spacing: -1px;
    }

    .cover-subtitle {
      font-size: 32px;
      font-weight: 400;
      color: var(--text-gray);
    }

    /* Products Page Styles */
    .section-heading {
      font-size: 28px;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 30px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;
    }

    .product-card {
      border: 2px solid var(--primary-color);
      border-radius: 12px;
      padding: 20px;
      background-color: white;
    }

    .product-image-container {
      height: 220px;
      background-color: rgba(153, 153, 153, 0.1);
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 15px;
      position: relative;
      overflow: hidden;
    }

    .product-image {
      max-width: 80%;
      max-height: 80%;
      object-fit: contain;
    }

    .logo-overlay {
      position: absolute;
      bottom: 10px;
      right: 10px;
      max-width: 50px;
      max-height: 50px;
      background-color: white;
      padding: 5px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .logo-overlay img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      display: block;
    }

    .product-name {
      font-size: 18px;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 8px;
    }

    .product-price {
      font-size: 14px;
      color: var(--text-gray);
    }

    /* Footer Attribution */
    .footer-attribution {
      position: absolute;
      bottom: 0.5in;
      left: 0.75in;
      right: 0.75in;
      text-align: center;
      font-size: 10px;
      color: var(--text-light);
    }

    /* Print-specific styles */
    @media print {
      body {
        margin: 0;
        padding: 0;
      }

      .page {
        margin: 0;
        box-shadow: none;
      }
    }

    /* Responsive fallback for preview */
    @media screen and (max-width: 8.5in) {
      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <!-- PAGE 1: Cover Page -->
  <div class="page">
    <header class="header">
      <img
        src="${escapeHtml(logoUrl)}"
        alt="${escapeHtml(companyName)} Logo"
        class="header-logo"
        crossorigin="anonymous"
      />
      <div class="header-ae-info">
        <div class="ae-name">${escapeHtml(accountExecutive.name)}</div>
        <div class="ae-contact">
          ${escapeHtml(accountExecutive.email)}<br>
          ${escapeHtml(accountExecutive.phone)}
        </div>
      </div>
    </header>

    <div class="cover-content">
      <h1 class="cover-title">Custom Gift Guide</h1>
      <p class="cover-subtitle">for ${escapeHtml(companyName)}</p>
    </div>
  </div>

  <!-- PAGE 2: Products Page -->
  <div class="page">
    <header class="header">
      <img
        src="${escapeHtml(logoUrl)}"
        alt="${escapeHtml(companyName)} Logo"
        class="header-logo"
        crossorigin="anonymous"
      />
      <div class="header-ae-info">
        <div class="ae-name">${escapeHtml(accountExecutive.name)}</div>
        <div class="ae-contact">
          ${escapeHtml(accountExecutive.email)}<br>
          ${escapeHtml(accountExecutive.phone)}
        </div>
      </div>
    </header>

    <h2 class="section-heading">Featured Products</h2>

    <div class="products-grid">
      ${DEFAULT_PRODUCTS.map(product => generateProductCard(product, logoUrl)).join('\n      ')}
    </div>

    <footer class="footer-attribution">
      Logos provided by apistemic logos API
    </footer>
  </div>
</body>
</html>`;
}

/**
 * Generates HTML for a single product card
 * @param product - Product data
 * @param logoUrl - Company logo URL for overlay
 * @returns HTML string for the product card
 */
function generateProductCard(product: Product, logoUrl: string): string {
  return `<div class="product-card">
        <div class="product-image-container">
          <img
            src="${escapeHtml(product.imageUrl)}"
            alt="${escapeHtml(product.name)}"
            class="product-image"
            crossorigin="anonymous"
          />
          <div class="logo-overlay">
            <img
              src="${escapeHtml(logoUrl)}"
              alt="Company Logo"
              crossorigin="anonymous"
            />
          </div>
        </div>
        <div class="product-name">${escapeHtml(product.name)}</div>
        <div class="product-price">${escapeHtml(product.price)}</div>
      </div>`;
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param str - String to escape
 * @returns Escaped string safe for HTML insertion
 */
function escapeHtml(str: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * Generates HTML email body for the gift guide delivery
 * @param companyName - Company name for personalization
 * @param aeName - Account Executive name for signature
 * @returns HTML string for email body
 */
export function generateEmailBody(companyName: string, aeName: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 16px;
      line-height: 1.6;
      color: #333333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .greeting {
      margin-bottom: 20px;
    }
    .message {
      margin-bottom: 20px;
    }
    .signature {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eeeeee;
    }
    .signature-name {
      font-weight: 600;
      color: #0066CC;
    }
    .signature-title {
      color: #666666;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="greeting">
    <p>Hello,</p>
  </div>

  <div class="message">
    <p>Thank you for your interest in custom branded merchandise for <strong>${escapeHtml(companyName)}</strong>.</p>
    <p>Please find attached your personalized Custom Gift Guide, featuring a curated selection of premium products that can be customized with your brand.</p>
    <p>Each item in this guide has been selected to help you create memorable branded experiences for your team, clients, and partners.</p>
    <p>If you have any questions or would like to discuss your custom merchandise needs, please don't hesitate to reach out.</p>
  </div>

  <div class="signature">
    <p class="signature-name">${escapeHtml(aeName)}</p>
    <p class="signature-title">Account Executive<br>UpMerch</p>
  </div>
</body>
</html>`;
}
