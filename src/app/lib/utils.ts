/**
 * Utility functions for logo fetching, color extraction, and helper methods
 */

import axios from 'axios';
import { extractColors } from 'extract-colors';
import type { BrandColors, LogoFetchResult, ExtractedColor } from '../types';

// Default fallback colors if extraction fails
const DEFAULT_COLORS: BrandColors = {
  primary: '#0066CC',
  secondary: '#999999',
  background: '#FFFFFF',
};

/**
 * Fetches company logo from apistemic logo API
 * @param domain - Company domain (e.g., "nike.com")
 * @returns LogoFetchResult with logo URL or error
 */
export async function fetchCompanyLogo(domain: string): Promise<LogoFetchResult> {
  const logoApiUrl = `https://logos-api.apistemic.com/domain:${domain}`;

  console.log(`[${new Date().toISOString()}] Fetching logo for domain: ${domain}`);
  console.log(`[${new Date().toISOString()}] Logo API URL: ${logoApiUrl}`);

  try {
    // Make a HEAD request first to verify the logo exists
    const response = await axios.head(logoApiUrl, {
      timeout: 5000,
      validateStatus: (status) => status === 200,
    });

    if (response.status === 200) {
      console.log(`[${new Date().toISOString()}] Logo fetch successful for ${domain}`);
      return {
        success: true,
        logoUrl: logoApiUrl,
      };
    }

    throw new Error(`Unexpected status code: ${response.status}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${new Date().toISOString()}] Logo fetch failed for ${domain}: ${errorMessage}`);

    return {
      success: false,
      logoUrl: null,
      error: errorMessage,
    };
  }
}

/**
 * Converts RGB values to HEX color string
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns HEX color string (e.g., "#FF5733")
 */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number): string => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Validates if a string is a valid HEX color
 * @param color - Color string to validate
 * @returns boolean indicating if color is valid HEX
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Extracts brand colors from a logo image URL
 * @param logoUrl - URL of the logo image
 * @returns BrandColors object with extracted or default colors
 */
export async function extractBrandColors(logoUrl: string): Promise<BrandColors> {
  console.log(`[${new Date().toISOString()}] Extracting colors from logo: ${logoUrl}`);

  try {
    // Download the image as a buffer
    const response = await axios.get(logoUrl, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });

    const imageBuffer = Buffer.from(response.data);

    // Convert buffer to base64 data URL for extract-colors
    const contentType = response.headers['content-type'] || 'image/webp';
    const base64 = imageBuffer.toString('base64');
    const dataUrl = `data:${contentType};base64,${base64}`;

    // Extract colors from the image
    const colors = await extractColors(dataUrl, {
      pixels: 64000,
      distance: 0.2,
      crossOrigin: 'anonymous',
      saturationDistance: 0.2,
      lightnessDistance: 0.2,
      hueDistance: 0.05,
    }) as ExtractedColor[];

    console.log(`[${new Date().toISOString()}] Extracted ${colors.length} colors from logo`);

    if (colors.length === 0) {
      console.warn(`[${new Date().toISOString()}] No colors extracted, using defaults`);
      return DEFAULT_COLORS;
    }

    // Sort colors by area (prominence) in descending order
    const sortedColors = colors.sort((a, b) => b.area - a.area);

    // Filter out very light colors (likely white backgrounds) and very dark colors
    const usableColors = sortedColors.filter(
      (c) => c.lightness > 0.1 && c.lightness < 0.9 && c.saturation > 0.1
    );

    // If no usable colors found after filtering, use all colors
    const colorsToUse = usableColors.length >= 2 ? usableColors : sortedColors;

    // Extract primary color (most prominent usable color)
    const primaryColor = colorsToUse[0]?.hex || DEFAULT_COLORS.primary;

    // Extract secondary color (second most prominent or complementary)
    const secondaryColor = colorsToUse[1]?.hex || colorsToUse[0]?.hex || DEFAULT_COLORS.secondary;

    // Extract accent color (third color if available)
    const accentColor = colorsToUse[2]?.hex;

    // Validate extracted colors
    const result: BrandColors = {
      primary: isValidHexColor(primaryColor) ? primaryColor : DEFAULT_COLORS.primary,
      secondary: isValidHexColor(secondaryColor) ? secondaryColor : DEFAULT_COLORS.secondary,
      background: DEFAULT_COLORS.background,
      accent: accentColor && isValidHexColor(accentColor) ? accentColor : undefined,
    };

    console.log(`[${new Date().toISOString()}] Extracted brand colors:`, result);

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[${new Date().toISOString()}] Color extraction failed: ${errorMessage}`);
    console.log(`[${new Date().toISOString()}] Using default fallback colors`);

    return DEFAULT_COLORS;
  }
}

/**
 * Sanitizes company name for use in filenames
 * @param companyName - Original company name
 * @returns Sanitized string safe for filenames
 */
export function sanitizeFilename(companyName: string): string {
  return companyName
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Validates email address format
 * @param email - Email address to validate
 * @returns boolean indicating if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates domain format
 * @param domain - Domain to validate
 * @returns boolean indicating if domain is valid
 */
export function isValidDomain(domain: string): boolean {
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}$/;
  return domainRegex.test(domain);
}

/**
 * Creates a timestamp string for logging
 * @returns ISO formatted timestamp
 */
export function timestamp(): string {
  return new Date().toISOString();
}
