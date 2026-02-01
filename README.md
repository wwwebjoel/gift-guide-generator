# Gift Guide Generator

A Next.js API service that generates personalized, branded PDF gift guides and delivers them via email. The system automatically fetches company logos, extracts brand colors, and creates professional multi-page PDF documents.

## Features

- **Automatic Logo Fetching**: Retrieves company logos using the apistemic logos API
- **Brand Color Extraction**: Analyzes logos to extract dominant brand colors
- **Dynamic PDF Generation**: Creates professional, print-optimized PDF documents using Puppeteer
- **Email Delivery**: Sends gift guides via Mailtrap SMTP with PDF attachments
- **Serverless Ready**: Configured for Vercel deployment with appropriate timeouts and memory allocation

## Technology Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Styling**: Tailwind CSS
- **PDF Generation**: puppeteer-core with @sparticuz/chromium
- **Color Extraction**: extract-colors
- **HTTP Client**: axios
- **Email**: nodemailer with Mailtrap SMTP
- **Image Processing**: sharp

## Project Structure

```
gift-guide-generator/
├── app/
│   ├── api/
│   │   └── generate-guide/
│   │       └── route.ts        # Main API endpoint
│   ├── lib/
│   │   ├── template.ts         # HTML template generator
│   │   └── utils.ts            # Utility functions
│   ├── types.ts                # TypeScript definitions
│   └── ...
├── .env.local.example          # Environment variables template
├── vercel.json                 # Vercel deployment config
├── postman_collection.json     # Postman API collection
└── README.md
```

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd gift-guide-generator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and fill in your Mailtrap credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Mailtrap credentials:

```env
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASS=your_mailtrap_password
NODE_ENV=development
```

**Important**: Never commit `.env.local` to version control.

### 4. Get Mailtrap Credentials

1. Sign up for a free account at [Mailtrap.io](https://mailtrap.io)
2. Go to your inbox settings
3. Find the SMTP credentials under "Integrations"
4. Copy the username and password to your `.env.local` file

## Running the Application

### Development Server

```bash
npm run dev
```

The server will start at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## API Endpoint

### POST /api/generate-guide

Generates a branded PDF gift guide and emails it to the specified recipient.

#### Request Body

```json
{
  "companyName": "Nike",
  "domain": "nike.com",
  "recipientEmail": "test@example.com",
  "aeName": "Kevin Smith",
  "aeEmail": "kevin@upmerch.com",
  "aePhone": "+1-555-0100"
}
```

#### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| companyName | string | Yes | Company name to display in the guide |
| domain | string | Yes | Company domain for logo fetching (e.g., "nike.com") |
| recipientEmail | string | Yes | Email address to send the guide to |
| aeName | string | Yes | Account Executive name |
| aeEmail | string | Yes | Account Executive email |
| aePhone | string | Yes | Account Executive phone number |

#### Success Response (200)

```json
{
  "success": true,
  "message": "Gift guide generated and emailed successfully to test@example.com",
  "companyName": "Nike",
  "recipientEmail": "test@example.com"
}
```

#### Error Response (400/500)

```json
{
  "success": false,
  "error": "Description of the error"
}
```

## Testing the API

### Using cURL

```bash
curl -X POST http://localhost:3000/api/generate-guide \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Nike",
    "domain": "nike.com",
    "recipientEmail": "test@example.com",
    "aeName": "Kevin Smith",
    "aeEmail": "kevin@upmerch.com",
    "aePhone": "+1-555-0100"
  }'
```

### Using PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/generate-guide" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"companyName":"Nike","domain":"nike.com","recipientEmail":"test@example.com","aeName":"Kevin Smith","aeEmail":"kevin@upmerch.com","aePhone":"+1-555-0100"}'
```

### Using Postman

1. Import the `postman_collection.json` file into Postman
2. Set the `base_url` environment variable to `http://localhost:3000`
3. Run the "Generate Gift Guide" request

### Checking Test Emails

1. Log into your [Mailtrap.io](https://mailtrap.io) account
2. Navigate to your inbox
3. Find the email with subject "Your Custom Gift Guide - [Company Name]"
4. View the email content and download the PDF attachment

## How It Works

1. **Request Validation**: The API validates all required fields and formats
2. **Logo Fetching**: Retrieves the company logo from apistemic logos API
3. **Color Extraction**: Analyzes the logo to extract dominant brand colors
4. **Template Generation**: Creates a multi-page HTML document with:
   - Cover page with company branding
   - Products page with logo-branded merchandise
5. **PDF Generation**: Renders HTML to PDF using Puppeteer with serverless Chrome
6. **Email Delivery**: Sends the PDF as an attachment via Mailtrap SMTP

## Troubleshooting

### Puppeteer Not Launching

**Symptoms**: Error about browser executable not found

**Solution**:
- Ensure `@sparticuz/chromium` is installed
- Check that you have sufficient memory (increase in `vercel.json` if needed)
- On Windows, you may need to install Chrome manually for local development

### Logo Fetch Failures

**Symptoms**: "Logo fetch failed" in console logs

**Possible Causes**:
- Invalid domain format
- Company logo not available in apistemic database
- Network connectivity issues

**Solution**: The API gracefully falls back to a placeholder logo when fetching fails.

### Email Not Sending

**Symptoms**: "Mailtrap credentials not configured" message

**Solution**:
1. Verify `.env.local` exists with correct credentials
2. Check that `MAILTRAP_USER` and `MAILTRAP_PASS` are set
3. Verify credentials match your Mailtrap inbox settings

### PDF Not Generating / Timeout Issues

**Symptoms**: Request times out or fails during PDF generation

**Solutions**:
- Increase timeout in `vercel.json` (max 30 seconds on Vercel Hobby plan)
- Ensure external images are accessible
- Check for JavaScript errors in the HTML template

### Color Extraction Fails

**Symptoms**: Default colors used instead of brand colors

**Possible Causes**:
- Logo image format not supported
- Very simple logo with few colors
- Image too small for analysis

**Solution**: The API uses fallback colors (#0066CC, #999999, #FFFFFF) automatically.

## Deployment

### Deploy to Vercel

1. Push your code to a Git repository
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `MAILTRAP_USER`
   - `MAILTRAP_PASS`
4. Deploy

The `vercel.json` configuration sets:
- 30 second timeout for the API route
- 1024MB memory allocation

## API Attribution

Company logos are provided by [apistemic logos API](https://logos-api.apistemic.com).

## License

MIT
