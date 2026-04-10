import os

files = {
    "package.json": """{
  "name": "excel-to-pdf",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18",
    "react-dom": "^18",
    "lucide-react": "^0.378.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "eslint": "^8",
    "eslint-config-next": "14.2.3"
  }
}""",
    "tsconfig.json": """{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}""",
    "next.config.js": """/** @type {import('next').NextConfig} */
const nextConfig = {
    rewrites: async () => {
        return [
            {
                source: '/api/:path*',
                destination: process.env.NODE_ENV === 'development'
                    ? 'http://127.0.0.1:5328/api/:path*'
                    : '/api/:path*',
            },
        ]
    },
};

module.exports = nextConfig;""",
    "tailwind.config.js": """const config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;""",
    "postcss.config.js": """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};""",
    "vercel.json": """{
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    },
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.py"
    }
  ]
}""",
    "api/requirements.txt": """Flask==3.0.3
pandas==2.2.2
openpyxl==3.1.2
xhtml2pdf==0.2.16
Werkzeug==3.0.3""",
    "api/index.py": """from flask import Flask, request, send_file, jsonify
import pandas as pd
import io
import os
from xhtml2pdf import pisa
from xml.sax.saxutils import escape

app = Flask(__name__)

# Basic layout CSS for PDF
BASE_CSS = \"\"\"
<style>
@page {
    size: a4 landscape;
    margin: 1cm;
}
body {
    font-family: Helvetica, Arial, sans-serif;
    font-size: 10px;
}
table {
    width: 100%;
    border-collapse: collapse;
}
th, td {
    border: 1px solid #ddd;
    padding: 4px;
    text-align: left;
    word-wrap: break-word;
}
th {
    background-color: #f2f2f2;
}
h2 {
    color: #333;
    font-size: 14px;
}
</style>
\"\"\"

@app.route('/api/convert', methods=['POST'])
def convert_excel_to_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith(('.xlsx', '.xls')):
        return jsonify({"error": "Invalid file type. Please upload .xlsx or .xls"}), 400

    try:
        all_sheets = pd.read_excel(file, sheet_name=None)
        
        html_content = "<html><head><meta charset='utf-8'>" + BASE_CSS + "</head><body>"
        
        for sheet_name, df in all_sheets.items():
            html_content += f"<h2>Sheet: {escape(str(sheet_name))}</h2>"
            if df.empty:
                html_content += "<p>Empty Sheet</p>"
            else:
                html_content += df.to_html(index=False, na_rep='', justify='left')
            html_content += "<pdf:nextpage />"
        
        html_content += "</body></html>"
        
        pdf_io = io.BytesIO()
        pisa_status = pisa.CreatePDF(html_content, dest=pdf_io)
        
        if pisa_status.err:
            return jsonify({"error": "Failed to generate PDF"}), 500
            
        pdf_io.seek(0)
        output_filename = os.path.splitext(file.filename)[0] + '.pdf'
        
        return send_file(pdf_io, download_name=output_filename, as_attachment=True, mimetype='application/pdf')

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5328)
""",
    "app/globals.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
  min-height: 100vh;
}
""",
    "app/layout.tsx": """import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Excel to PDF Converter",
  description: "A modern web app to batch convert Excel files to PDF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
""",
    "app/page.tsx": """'use client';
import React, { useState, useCallback } from 'react';
import { UploadCloud, FileType, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (f: File) => {
    setError(null);
    setSuccess(false);
    if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      setError("Please select a valid Excel file (.xlsx, .xls)");
      return;
    }
    setFile(f);
  };

  const resetState = () => {
    setFile(null);
    setSuccess(false);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({error: 'Network response was not ok'}));
        throw new Error(errData.error || 'Failed to convert file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\\.[^/.]+$/, "") + ".pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute bottom-[10%] -right-[10%] w-[30%] h-[30%] rounded-full bg-purple-200/40 blur-3xl" />
      </div>

      <div className="w-full max-w-2xl p-8 bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Excel to PDF
          </h1>
          <p className="text-lg leading-relaxed text-gray-600">
            Batch convert multi-sheet Excel files into high-quality PDFs with precise formatting.
          </p>
        </div>

        {!file ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-indigo-100 rounded-2xl bg-indigo-50/30 hover:bg-indigo-50/80 transition-all cursor-pointer group"
            onClick={() => document.getElementById('fileUpload')?.click()}
          >
            <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-lg font-semibold text-gray-800 mb-1">
              Click or drag your Excel file here
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Supports .xlsx and .xls
            </p>
            <input
              id="fileUpload"
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleChange}
            />
            <button className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-full hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
              Select File
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between w-full p-4 mb-6 bg-white rounded-xl shadow-sm border border-indigo-100">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <FileType className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 line-clamp-1">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              {!loading && !success && (
                <button onClick={resetState} className="text-sm text-gray-500 hover:text-red-500 transition-colors">
                  Remove
                </button>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 mb-6 w-full text-red-700 bg-red-50 rounded-xl border border-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success ? (
              <div className="flex flex-col items-center justify-center p-8 w-full border border-green-200 bg-green-50 rounded-2xl">
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                <p className="text-lg font-semibold text-green-800 mb-2">Conversion Complete!</p>
                <p className="text-sm text-green-600 mb-6 text-center">Your PDF has been downloaded successfully.</p>
                <button
                  onClick={resetState}
                  className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition-colors shadow-md shadow-green-200"
                >
                  Convert Another File
                </button>
              </div>
            ) : (
              <button
                onClick={handleConvert}
                disabled={loading}
                className={`w-full py-3.5 px-6 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                  loading 
                    ? 'bg-indigo-400 cursor-not-allowed shadow-indigo-200' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-300 hover:shadow-indigo-400 hover:-translate-y-0.5'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Converting...
                  </>
                ) : (
                  'Convert File'
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
"""
}

for filepath, content in files.items():
    dirname = os.path.dirname(filepath)
    if dirname and not os.path.exists(dirname):
        os.makedirs(dirname, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Scaffolding completed successfully.")
