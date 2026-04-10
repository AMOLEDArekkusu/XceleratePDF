'use client';
import React, { useState, useCallback } from 'react';
import { UploadCloud, FileType, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [separateSheets, setSeparateSheets] = useState(false);

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
    formData.append('separate_sheets', separateSheets.toString());

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
      const isZip = response.headers.get('content-type')?.includes('zip');
      a.download = file.name.replace(/\.[^/.]+$/, "") + (isZip ? "_sheets.zip" : ".pdf");
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
            XceleratePDF
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

            {!loading && !success && (
              <div className="flex items-center gap-3 w-full p-4 mb-6 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <input
                  type="checkbox"
                  id="separateSheets"
                  checked={separateSheets}
                  onChange={(e) => setSeparateSheets(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 transition-colors cursor-pointer"
                />
                <label htmlFor="separateSheets" className="text-gray-700 font-medium cursor-pointer select-none">
                  Separate each sheet into its own PDF (.zip format)
                </label>
              </div>
            )}

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
