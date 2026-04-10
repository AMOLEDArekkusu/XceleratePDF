<div align="center">
<<<<<<< HEAD



  <h1>XceleratePDF</h1>

  <p>
    A modern, full-stack web application for batch converting multi-sheet Excel workbooks into unified or individually-split PDF documents — with full Unicode and multilingual support.
  </p>

  <p>
    <a href="https://github.com/AMOLEDArekkusu/XceleratePDF"><strong>📖 Explore the Docs »</strong></a>
    &nbsp;·&nbsp;
    <a href="https://your-vercel-deployment.vercel.app">🚀 Live Demo</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/AMOLEDArekkusu/XceleratePDF/issues">🐛 Report Bug</a>
    &nbsp;·&nbsp;
    <a href="https://github.com/AMOLEDArekkusu/XceleratePDF/issues">✨ Request Feature</a>
  </p>

  <br/>

  ![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)
  ![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Python](https://img.shields.io/badge/Python_3-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
  ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

</div>
=======
  
  <h3 align="center">XceleratePDF</h3>


>>>>>>> e1b6923387bfb0ac64e24735fb5a7f889bab95f7

---

## Table of Contents

<details>
  <summary>Expand</summary>

  1. [Project Overview](#project-overview)
  2. [High-Level Architecture](#high-level-architecture)
  3. [Component Map](#component-map)
  4. [Key Subsystems](#key-subsystems)
     - [Frontend — Next.js UI](#frontend--nextjs-ui)
     - [Backend — Python / Flask API](#backend--python--flask-api)
     - [Infrastructure & Deployment](#infrastructure--deployment)
  5. [Getting Started](#getting-started)
     - [Prerequisites](#prerequisites)
     - [Installation](#installation)
     - [Running Locally](#running-locally)
  6. [Usage](#usage)
  7. [API Reference](#api-reference)
  8. [Roadmap](#roadmap)
  9. [License](#license)

</details>

---

## Project Overview

**XceleratePDF** is a production-ready, serverless web application that converts Excel files (`.xlsx` / `.xls`) into high-fidelity PDF documents directly in the browser.

The application is architectured as a **decoupled full-stack system**:

- The **frontend** (Next.js + Tailwind CSS) provides a drag-and-drop interface with real-time feedback.
- The **backend** (Python Flask serverless function) handles all the heavy file-processing — reading multi-sheet workbooks via `pandas`, and rendering them to formatted PDFs via `reportlab`.
- Both layers are **co-deployed on Vercel** without any custom CI/CD pipelines, using Vercel's native multi-builder support.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          User's Browser                             │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │              Next.js Frontend (app/page.tsx)                 │  │
│   │                                                              │  │
│   │  • Drag & drop zone → FormData construction                  │  │
│   │  • Toggle: Unified PDF vs. Per-Sheet ZIP                     │  │
│   │  • POST /api/convert → blob download trigger                 │  │
│   └──────────────────────────────────────────┬───────────────────┘  │
└─────────────────────────────────────────────┐│──────────────────────┘
                                              ││
                              HTTP POST (multipart/form-data)
                                              ││
┌─────────────────────────────────────────────▼───────────────────────┐
│                    Vercel Serverless Runtime                         │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │             Python Flask Backend (api/index.py)              │  │
│   │                                                              │  │
│   │  1. Receive .xlsx / .xls via request.files                   │  │
│   │  2. Parse all sheets with pandas.read_excel()                │  │
│   │  3. Render tables → ReportLab PDF (landscape A4)             │  │
│   │  4. Return: single .pdf  OR  multi-sheet .zip                │  │
│   └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Map

| Component | Path | Responsibility |
|---|---|---|
| Root UI Page | `app/page.tsx` | Main drag-and-drop interface, conversion controls, download trigger |
| Global Styles | `app/globals.css` | Base Tailwind layer resets |
| Root Layout | `app/layout.tsx` | HTML shell, metadata, font declarations |
| Flask API Endpoint | `api/index.py` | `/api/convert` — Excel parsing, PDF generation, ZIP packaging |
| Python Dependencies | `api/requirements.txt` | Flask, pandas, openpyxl, reportlab, Werkzeug |
| Vercel Config | `vercel.json` | Builder routing for `@vercel/next` and `@vercel/python` |
| Next.js Config | `next.config.js` | Rewrites for local dev API proxy |
| Tailwind Config | `tailwind.config.js` | Content paths, theme extensions |

---

## Key Subsystems

### Frontend — Next.js UI

<details>
  <summary>Relevant source files</summary>

  - `app/page.tsx`
  - `app/layout.tsx`
  - `app/globals.css`

</details>

The UI is a **single-page React application** built with Next.js 14 (App Router) and styled with Tailwind CSS. Key interaction patterns:

- **File Ingestion**: A dedicated drag-and-drop zone accepts `.xlsx` / `.xls` files. The file is wrapped into a `FormData` object for submission.
- **Mode Selection**: A toggle allows users to choose between:
  - **Unified PDF** — all sheets merged into one paginated PDF.
  - **Per-Sheet ZIP** — each sheet exported as a separate PDF, bundled into a `.zip` archive.
- **Download Flow**: The frontend `fetch`-es `POST /api/convert`, receives a binary blob (`application/pdf` or `application/zip`), creates an object URL, and programmatically triggers a browser download — no page reload required.

---

### Backend — Python / Flask API

<details>
  <summary>Relevant source files</summary>

  - `api/index.py`
  - `api/requirements.txt`

</details>

The backend is a single Flask application running as a **Vercel Python Serverless Function**.

#### Data Flow within `api/index.py`

```
POST /api/convert
      │
      ▼
  Validate file (type: .xlsx / .xls, presence check)
      │
      ▼
  pd.read_excel(file, sheet_name=None)
  → { "Sheet1": DataFrame, "Sheet2": DataFrame, ... }
      │
      ├─── separate_sheets=true AND sheets > 1
      │         │
      │         ▼
      │    For each sheet → create_pdf_for_sheet_list({sheet})
      │    → ZipFile (in-memory BytesIO)
      │    → send_file(.zip)
      │
      └─── (default) all sheets together
                │
                ▼
           create_pdf_for_sheet_list(all_sheets)
           → SimpleDocTemplate (landscape A4)
           → ReportLab Table per sheet + PageBreak
           → send_file(.pdf)
```

#### `create_pdf_for_sheet_list()` — PDF Rendering Details

| Property | Value |
|---|---|
| Page Size | A4 Landscape |
| Margins | 30pt left/right, 30pt top, 18pt bottom |
| Column Width | Auto-computed: `(page_width - 60) / num_columns` |
| Header Style | Helvetica-Bold, light grey background (`#f2f2f2`) |
| Cell Style | CJK word-wrap enabled (Unicode / multilingual safe) |
| Grid | 0.25pt inner grid + outer box border |
| Sheet Separator | `PageBreak` between each sheet |

---

### Infrastructure & Deployment

<details>
  <summary>Relevant source files</summary>

  - `vercel.json`
  - `next.config.js`
  - `package.json`

</details>

The project uses Vercel's **multi-builder** configuration to co-host both runtimes from a single repository.

**`vercel.json` routing logic:**

```json
{
  "builds": [
    { "src": "api/index.py",   "use": "@vercel/python" },
    { "src": "package.json",   "use": "@vercel/next"   }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.py" }
  ]
}
```

All requests to `/api/*` are routed to the Python serverless function. All other routes are handled by the Next.js build.

**Local development** uses a Next.js `rewrites` rule (in `next.config.js`) to proxy `/api/*` calls to the local Flask server running on `http://localhost:5328`.

---

## Getting Started

### Prerequisites

Ensure the following are installed globally:

| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18.x | Next.js frontend runtime |
| npm | ≥ 9.x | Package management |
| Python | ≥ 3.9 | Backend API runtime |
| pip | latest | Python package management |

### Installation

**1. Clone the repository**
```sh
git clone https://github.com/AMOLEDArekkusu/XceleratePDF.git
cd XceleratePDF
```

**2. Install frontend dependencies**
```sh
npm install
```

**3. Set up the Python backend (for local development)**
```sh
cd api
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Running Locally

Open **two terminals**:

**Terminal 1 — Backend (Flask)**
```sh
cd api
venv\Scripts\activate   # or: source venv/bin/activate
python index.py
# Flask runs on http://localhost:5328
```

**Terminal 2 — Frontend (Next.js)**
```sh
npm run dev
# Next.js runs on http://localhost:3000
```

Access the application at **`http://localhost:3000`**. The Next.js dev server automatically proxies `/api/*` requests to Flask via `next.config.js` rewrites.

---

## Usage

1. Open the application in your browser.
2. **Drag and drop** or **click to browse** for an `.xlsx` or `.xls` file.
3. Choose your conversion mode:
   - 🗂️ **Unified PDF** — all sheets in one document (default).
   - 📦 **Per-Sheet ZIP** — each sheet as a separate PDF, zipped together.
4. Click **Convert** and your download will begin automatically.

> **Note:** Large workbooks with many sheets or thousands of rows may take a few seconds to process. The serverless function has a Vercel execution time limit of 10 seconds on the Hobby plan.

---

## API Reference

### `POST /api/convert`

Converts an uploaded Excel file to PDF or ZIP.

**Request**

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | `multipart/form-data` | ✅ | The `.xlsx` or `.xls` file to convert |
| `separate_sheets` | `string` (`"true"` / `"false"`) | ❌ | If `"true"` and multiple sheets exist, returns a ZIP archive |

**Responses**

| Status | Content-Type | Body |
|---|---|---|
| `200 OK` | `application/pdf` | Single PDF containing all sheets |
| `200 OK` | `application/zip` | ZIP archive of per-sheet PDFs |
| `400 Bad Request` | `application/json` | `{ "error": "..." }` |
| `500 Internal Server Error` | `application/json` | `{ "error": "..." }` |

---

## Roadmap

- [x] Multi-sheet Excel parsing via pandas
- [x] PDF generation with ReportLab (Unicode / CJK cell wrap)
- [x] Per-sheet ZIP export mode
- [x] Zero-config Vercel deployment
- [x] Sheet selection UI (choose which sheets to export)
- [x] Dark mode support
- [x] Configurable PDF page orientation (Portrait / Landscape toggle)
- [x] Column width customization per sheet
- [x] Preview pane before download

---

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.

---

<div align="center">
  <sub>Built with ❤️ using Next.js, Python, and Vercel.</sub>
</div>
