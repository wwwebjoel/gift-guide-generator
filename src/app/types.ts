/**
 * TypeScript type definitions for the Gift Guide Generator API
 */

/**
 * Request payload for the generate-guide API endpoint
 */
export interface GenerateGuideRequest {
  companyName: string;
  domain: string;
  recipientEmail: string;
  aeName: string;
  aeEmail: string;
  aePhone: string;
}

/**
 * Success response from the generate-guide API endpoint
 */
export interface GenerateGuideSuccessResponse {
  success: true;
  message: string;
  companyName: string;
  recipientEmail: string;
  htmlPreview?: string;
}

/**
 * Error response from the generate-guide API endpoint
 */
export interface GenerateGuideErrorResponse {
  success: false;
  error: string;
  stack?: string;
}

/**
 * Union type for all possible API responses
 */
export type GenerateGuideResponse = GenerateGuideSuccessResponse | GenerateGuideErrorResponse;

/**
 * Brand colors extracted from company logo
 */
export interface BrandColors {
  primary: string;
  secondary: string;
  background: string;
  accent?: string;
}

/**
 * Account Executive information
 */
export interface AccountExecutive {
  name: string;
  email: string;
  phone: string;
}

/**
 * Template data for generating the HTML gift guide
 */
export interface TemplateData {
  companyName: string;
  logoUrl: string;
  colors: BrandColors;
  accountExecutive: AccountExecutive;
}

/**
 * Product item for the products page
 */
export interface Product {
  name: string;
  price: string;
  imageUrl: string;
}

/**
 * Color extraction result from extract-colors package
 */
export interface ExtractedColor {
  hex: string;
  red: number;
  green: number;
  blue: number;
  area: number;
  hue: number;
  saturation: number;
  lightness: number;
  intensity: number;
}

/**
 * Logo fetch result
 */
export interface LogoFetchResult {
  success: boolean;
  logoUrl: string | null;
  error?: string;
}

/**
 * Email send result
 */
export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
