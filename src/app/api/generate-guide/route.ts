/**
 * API Endpoint: POST /api/generate-guide
 *
 * Accepts company information, fetches logo, extracts brand colors,
 * generates a multi-page PDF gift guide, and emails it via Resend.
 */

import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Resend } from 'resend';
import type {
  GenerateGuideRequest,
  GenerateGuideSuccessResponse,
  GenerateGuideErrorResponse,
  TemplateData,
  BrandColors
} from '../../types';
import {
  fetchCompanyLogo,
  extractBrandColors,
  sanitizeFilename,
  isValidEmail,
  isValidDomain,
  timestamp
} from '../../lib/utils';
import { generateGiftGuideTemplate, generateEmailBody } from '../../lib/template';

// Default fallback colors
const DEFAULT_COLORS: BrandColors = {
  primary: '#0066CC',
  secondary: '#999999',
  background: '#FFFFFF',
};

// Placeholder logo for fallback
const PLACEHOLDER_LOGO = 'https://via.placeholder.com/180x70/cccccc/666666?text=Logo';

/**
 * Validates the incoming request payload
 * @param body - Request body to validate
 * @returns Object with isValid flag and error message if invalid
 */
function validateRequest(body: Partial<GenerateGuideRequest>): { isValid: boolean; error?: string } {
  const requiredFields: (keyof GenerateGuideRequest)[] = [
    'companyName',
    'domain',
    'recipientEmail',
    'aeName',
    'aeEmail',
    'aePhone'
  ];

  for (const field of requiredFields) {
    if (!body[field] || typeof body[field] !== 'string' || body[field].trim() === '') {
      return { isValid: false, error: `Missing or invalid required field: ${field}` };
    }
  }

  if (!isValidEmail(body.recipientEmail!)) {
    return { isValid: false, error: 'Invalid recipient email format' };
  }

  if (!isValidEmail(body.aeEmail!)) {
    return { isValid: false, error: 'Invalid AE email format' };
  }

  if (!isValidDomain(body.domain!)) {
    return { isValid: false, error: 'Invalid domain format (e.g., example.com)' };
  }

  return { isValid: true };
}

/**
 * Gets the Chrome executable path based on the environment
 * - Local Windows: Uses installed Chrome
 * - Serverless (Vercel): Uses @sparticuz/chromium
 */
async function getChromePath(): Promise<string> {
  const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL;

  if (isLocal) {
    // Common Chrome paths on Windows
    const windowsPaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    ];

    // Check which path exists
    const fs = await import('fs');
    for (const chromePath of windowsPaths) {
      if (chromePath && fs.existsSync(chromePath)) {
        console.log(`[${timestamp()}] Using local Chrome: ${chromePath}`);
        return chromePath;
      }
    }

    // Fallback to chromium for non-Windows local dev
    console.log(`[${timestamp()}] Local Chrome not found, trying @sparticuz/chromium`);
  }

  // Use serverless chromium
  const execPath = await chromium.executablePath();
  console.log(`[${timestamp()}] Using serverless chromium: ${execPath}`);
  return execPath;
}

/**
 * Generates PDF from HTML using Puppeteer with serverless Chrome
 * @param html - HTML content to render
 * @returns PDF buffer
 */
async function generatePDF(html: string): Promise<Buffer> {
  console.log(`[${timestamp()}] Launching Puppeteer browser...`);

  let browser = null;

  try {
    const executablePath = await getChromePath();
    const isLocal = process.env.NODE_ENV === 'development' || !process.env.VERCEL;

    browser = await puppeteer.launch({
      args: isLocal
        ? ['--no-sandbox', '--disable-setuid-sandbox']
        : chromium.args,
      defaultViewport: { width: 816, height: 1056 }, // Letter size at 96 DPI
      executablePath,
      headless: true,
    });

    console.log(`[${timestamp()}] Browser launched successfully`);

    const page = await browser.newPage();

    console.log(`[${timestamp()}] Setting HTML content...`);
    await page.setContent(html, {
      waitUntil: ['networkidle0', 'domcontentloaded'],
    });

    console.log(`[${timestamp()}] Generating PDF...`);
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    console.log(`[${timestamp()}] PDF generated successfully (${pdfBuffer.length} bytes)`);

    return Buffer.from(pdfBuffer);
  } finally {
    if (browser) {
      console.log(`[${timestamp()}] Closing browser...`);
      await browser.close();
    }
  }
}

/**
 * Sends email with PDF attachment via Resend
 * @param recipientEmail - Email address to send to
 * @param companyName - Company name for email subject
 * @param aeName - AE name for email signature
 * @param pdfBuffer - PDF file buffer to attach
 */
async function sendEmail(
  recipientEmail: string,
  companyName: string,
  aeName: string,
  pdfBuffer: Buffer
): Promise<void> {
  console.log(`[${timestamp()}] Configuring Resend...`);

  const resend = new Resend(process.env.RESEND_API_KEY);

  const sanitizedCompanyName = sanitizeFilename(companyName);
  const filename = `${sanitizedCompanyName}-Gift-Guide.pdf`;

  console.log(`[${timestamp()}] Sending email to ${recipientEmail}...`);

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'UpMerch <onboarding@resend.dev>',
    to: recipientEmail,
    subject: `Your Custom Gift Guide - ${companyName}`,
    html: generateEmailBody(companyName, aeName),
    attachments: [
      {
        filename,
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(error.message);
  }

  console.log(`[${timestamp()}] Email sent successfully. ID: ${data?.id}`);
}

/**
 * POST handler for /api/generate-guide
 */
export async function POST(request: NextRequest): Promise<NextResponse<GenerateGuideSuccessResponse | GenerateGuideErrorResponse>> {
  console.log(`[${timestamp()}] Received generate-guide request`);

  try {
    // Step 1: Parse and validate request body
    let body: Partial<GenerateGuideRequest>;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    console.log(`[${timestamp()}] Request payload:`, {
      companyName: body.companyName,
      domain: body.domain,
      recipientEmail: body.recipientEmail,
    });

    const validation = validateRequest(body);
    if (!validation.isValid) {
      console.log(`[${timestamp()}] Validation failed: ${validation.error}`);
      return NextResponse.json(
        { success: false, error: validation.error! },
        { status: 400 }
      );
    }

    const {
      companyName,
      domain,
      recipientEmail,
      aeName,
      aeEmail,
      aePhone,
    } = body as GenerateGuideRequest;

    // Step 2: Fetch company logo
    console.log(`[${timestamp()}] Step 2: Fetching company logo...`);
    const logoResult = await fetchCompanyLogo(domain);
    const logoUrl = logoResult.success && logoResult.logoUrl
      ? logoResult.logoUrl
      : PLACEHOLDER_LOGO;

    if (!logoResult.success) {
      console.warn(`[${timestamp()}] Logo fetch failed, using placeholder`);
    }

    // Step 3: Extract brand colors
    console.log(`[${timestamp()}] Step 3: Extracting brand colors...`);
    let colors: BrandColors;

    if (logoResult.success && logoResult.logoUrl) {
      colors = await extractBrandColors(logoResult.logoUrl);
    } else {
      console.log(`[${timestamp()}] Using default colors (no logo available)`);
      colors = DEFAULT_COLORS;
    }

    // Step 4: Generate HTML template
    console.log(`[${timestamp()}] Step 4: Generating HTML template...`);
    const templateData: TemplateData = {
      companyName,
      logoUrl,
      colors,
      accountExecutive: {
        name: aeName,
        email: aeEmail,
        phone: aePhone,
      },
    };

    const html = generateGiftGuideTemplate(templateData);

    if (!html || html.length === 0) {
      throw new Error('Failed to generate HTML template');
    }

    console.log(`[${timestamp()}] HTML template generated (${html.length} characters)`);

    // Step 5: Generate PDF with Puppeteer
    console.log(`[${timestamp()}] Step 5: Generating PDF...`);
    const pdfBuffer = await generatePDF(html);

    // Step 6: Send email with PDF attachment
    console.log(`[${timestamp()}] Step 6: Sending email...`);

    // Check for Resend API key
    if (!process.env.RESEND_API_KEY) {
      console.warn(`[${timestamp()}] Resend API key not configured, skipping email send`);
      console.log(`[${timestamp()}] PDF generated successfully but email not sent`);

      return NextResponse.json({
        success: true,
        message: `Gift guide PDF generated for ${companyName}. Email not sent (Resend API key not configured).`,
        companyName,
        recipientEmail,
        htmlPreview: html,
      });
    }

    // Try to send email, but don't fail if it doesn't work
    let emailSent = false;
    let emailError = '';

    try {
      await sendEmail(recipientEmail, companyName, aeName, pdfBuffer);
      emailSent = true;
    } catch (error) {
      emailError = error instanceof Error ? error.message : 'Unknown email error';
      console.error(`[${timestamp()}] Email sending failed: ${emailError}`);
    }

    // Step 7: Return success response (PDF was generated regardless of email status)
    console.log(`[${timestamp()}] Request completed. Email sent: ${emailSent}`);

    return NextResponse.json({
      success: true,
      message: emailSent
        ? `Gift guide generated and emailed successfully to ${recipientEmail}`
        : `Gift guide PDF generated for ${companyName}. Email failed: ${emailError}`,
      companyName,
      recipientEmail,
      htmlPreview: html,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    const stack = error instanceof Error ? error.stack : undefined;

    console.error(`[${timestamp()}] Error processing request:`, errorMessage);
    if (stack) {
      console.error(`[${timestamp()}] Stack trace:`, stack);
    }

    const response: GenerateGuideErrorResponse = {
      success: false,
      error: errorMessage,
    };

    // Include stack trace in development mode
    if (process.env.NODE_ENV === 'development' && stack) {
      response.stack = stack;
    }

    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { success: false, error: 'Method not allowed. Use POST request.' },
    { status: 405 }
  );
}
