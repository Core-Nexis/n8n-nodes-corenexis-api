# n8n-nodes-corenexis-api

An [n8n](https://n8n.io) community node for the [Corenexis API](https://api.corenexis.com): production REST APIs
for documents, OCR, email checks, images and codes, all behind one API key.

| | |
|---|---|
| **Markdown to PDF** | Markdown into a print-ready PDF or page images, with fonts, themes, colours, headers and footers |
| **HTML to PDF** | HTML and CSS rendered by a real browser engine into a PDF, page images or a screenshot |
| **Image to Text (OCR)** | Text from photos, screenshots, scans and receipts, as plain text and Markdown |
| **PDF to Text (OCR)** | Text from PDFs, scanned pages included, as a background job |
| **Email Validator** | Syntax, domain, MX, SPF, DMARC and mailbox checks |
| **Disposable Email Detector** | Throwaway and temporary addresses |
| **Image Conversion** | Convert between 20+ formats (HEIC, AVIF, TIFF, PSD and more), resize and compress |
| **Image CDN** | Host an image and get a fast delivery link |
| **QR Code and Barcode** | QR codes, UPI payment QR codes, Code 128, EAN-13 and UPC-A |
| **Account** | Key, subscriptions, usage and wallet balance (free) |

Maintained by [Corenexis](https://corenexis.com). Support: support@corenexis.com

- [Installation](#installation)
- [Credentials](#credentials)
- [Operations](#operations)
- [Files in and out](#files-in-and-out)
- [Plans and limits](#plans-and-limits)
- [Examples](#examples)
- [Compatibility](#compatibility)
- [Resources](#resources)

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/)
in the n8n documentation. In short: **Settings > Community Nodes > Install**, enter
`@corenexis/n8n-nodes-corenexis-api`, and confirm.

## Credentials

1. Sign up at [dash.corenexis.com](https://dash.corenexis.com/auth/signup).
2. Subscribe to the APIs you want to use. Every API has a free plan, and one key works for all of them.
3. Create a key under [API Keys](https://dash.corenexis.com/api-keys).
4. In n8n, create a **Corenexis API** credential and paste the key.

Saving the credential checks the key against the free account endpoint, so the test spends no quota.

## Operations

### Account (free, spends no quota)

| Operation | Returns |
|---|---|
| Get | Whether the key is valid, its owner, active subscriptions, wallet balance and anything due |
| Get Subscriptions | Every subscribed API with plan, status, renewal date, calls used this month, monthly limit and rate limit |

### Markdown to PDF > Convert

Markdown from a text field or from a `.md` binary file (up to 4 MB). Tables, task lists and highlighted code render.

| Field | Values |
|---|---|
| Output Format | PDF, or PNG page images (paid plans) |
| Download Result | Put the PDF or images in the item as binary files (default on). The hosted link is always returned. |

Options: Page Size (A3, A4, A5, Letter, Legal, Tabloid), Orientation, Margins in mm (0 to 100), Theme (light, dark),
Font (Roboto, Open Sans, Lato, Montserrat, Nunito, IBM Plex Sans, IBM Plex Serif, Liberation Serif,
Lohit Devanagari), Code Font (JetBrains Mono, IBM Plex Mono, Fira Code), Font Size (7 to 18 pt), Colors (text,
heading, link, accent, code text, code background, border, quote, background, table header background), Header
Text and Footer Text (`{PAGENO}` and `{nb}` become page number and page count), File Name, PNG Mode (all pages,
first page, one page), PNG Page and PNG Resolution (72 to 300 DPI).

### HTML to PDF > Convert

HTML from a text field or from an `.html` binary file (up to 2 MB).

Options: Page Size, Orientation, Custom Page Width and Height in mm (20 to 2000, replace Page Size), Margins,
Scale (0.1 to 2), Run JavaScript (paid plans) with Wait After Load (0 to 5000 ms), Header HTML and Footer HTML
(the classes `pageNumber` and `totalPages` are filled in), File Name, PNG Mode (all pages, first page, one page,
viewport screenshot), PNG Page and PNG Resolution.

### Image to Text (OCR) > Extract Text

The image comes from a binary field or a public URL (up to 50 MB). Returns `text`, `markdown`, image size and
counts of characters, words and lines. Option: Languages (30 languages, several at once; empty means automatic).

### PDF to Text (OCR)

| Operation | What it does |
|---|---|
| Extract Text and Wait | Submits the PDF, checks the job until it finishes and returns the text (and Markdown) |
| Submit Job | Starts a job and returns its `job_id` at once |
| Get Job | Status of a job and, once complete, its text. Spends no quota. |

The PDF comes from a binary field or a public URL (up to 50 MB). Options: Languages, Output Format (plain text,
Markdown, both), Pages (`all`, `5`, `2-9`, `2,7,9`), Webhook URL (the API posts the result there when the job
finishes, for example to an n8n Webhook node), Poll Interval and Max Wait for Extract Text and Wait.

### Email Validator > Validate

Returns `status` (`deliverable`, `risky`, `undeliverable`, `unknown`, `invalid`), `confidence`, syntax, domain, MX,
SPF and DMARC results, DNS records, disposable, role-based and free-provider flags, and the SMTP check.

### Disposable Email Detector > Check

Takes an address, a domain or a URL. Returns `disposable` (true or false) and the `domain` checked.

### Image Conversion > Convert

The image comes from a binary field or a public URL. Target formats: AVIF, BMP, DDS, EPS, EXR, GIF, HDR, HEIC, HEIF,
ICO, JPEG, JPEG 2000, JPEG XL, PCX, PDF, PNG, PSD, TGA, TIFF, WBMP, WebP, XBM and XPM. Options: Width, Height
(one keeps the aspect ratio, both force the size) and Quality (0 to 100). The converted file is downloaded into
the item by default.

### Image CDN > Upload

The image comes from a binary field or a public URL. Returns the hosted `url`, a `report_url` and the `expiry`.
Options: Width, Height, Quality (40 to 100) and Keep For (hours; your plan sets the maximum).

### QR Code and Barcode > Generate

| Type | Input |
|---|---|
| QR Code | Any text or link |
| UPI Payment QR | Payee UPI ID, payee name, amount in INR, note |
| QR Code for an Image | A picture URL; the picture is hosted for 30 days and the QR code links to it |
| Barcode: Code 128 | Up to 80 characters |
| Barcode: EAN-13 | Exactly 13 digits with a valid check digit |
| Barcode: UPC-A | Exactly 12 digits with a valid check digit |

Output: a PNG binary file in the item (default) or a hosted link. Options: Size (100 to 1000 px) and Logo URL
(placed in the middle of QR codes).

## Files in and out

- **In:** wherever an operation takes a file, choose **Binary File** and name the input field (default `data`),
  for example the output of an HTTP Request, Read Binary File, Google Drive or Gmail node. Or choose **URL**.
- **Out:** PDFs, page images and converted images are hosted by the API and returned as links (`url`,
  `expires_at` or `expiry`). With **Download Result** on, the node also puts them in the item as binary files,
  ready for Gmail, Google Drive, S3 or any other node. Extra page images go in `data_2`, `data_3` and so on.

Hosted links expire: about two hours on free plans and seven days on paid plans for PDFs.

## Plans and limits

Each API is subscribed to separately, with its own free plan. Some options need a paid plan, and the node says so
in each option's description: PNG output, custom themes and fonts, headers and footers, JavaScript rendering,
OCR language selection, Markdown output and webhooks for PDF to Text, larger files, longer image hosting and
larger QR codes. A refused option returns the API's message, which names the option and your plan's limit.
A call is charged only when it succeeds. Plans: [api.corenexis.com](https://api.corenexis.com).

## Examples

**Invoice email to PDF:** Gmail Trigger > Corenexis API (HTML to PDF, HTML = the email body) > Google Drive
(upload the `data` binary).

**Receipt scanning:** Telegram Trigger (photo) > Corenexis API (Image to Text, Binary File) > Google Sheets
(append `text`).

**Clean a signup list:** Google Sheets (read rows) > Corenexis API (Email Validator) > IF (`status` is
`deliverable`) > your CRM.

**Payment QR for an order:** Webhook (new order) > Corenexis API (QR Code and Barcode, UPI Payment QR, amount
from the order) > Send Email with the PNG attached.

**Long PDFs without waiting:** Corenexis API (PDF to Text, Submit Job, Webhook URL = the URL of an n8n Webhook
node) and a second workflow that starts at that Webhook node and receives the finished job.

## Compatibility

Built with the n8n node CLI and tested against n8n 1.x and 2.x. The node is also usable as a tool by the n8n AI
Agent.

## Resources

- [Corenexis API documentation](https://api.corenexis.com)
- [Dashboard: keys, subscriptions and usage](https://dash.corenexis.com)
- [Corenexis API and MCP server](https://github.com/Core-Nexis/corenexis-api)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
