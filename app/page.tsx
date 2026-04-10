'use client';
import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, FileType, CheckCircle2, AlertCircle, Loader2, Moon, Sun, Layout, Table as TableIcon, Settings, ChevronDown, ChevronRight } from 'lucide-react';

interface SheetInfo {
  name: string;
  columns: string[];
  preview: string[][];
}

interface SheetConfig {
  selected: boolean;
  widths: number[];
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [sheetsInfo, setSheetsInfo] = useState<SheetInfo[]>([]);
  const [sheetsConfig, setSheetsConfig] = useState<Record<string, SheetConfig>>({});
  
  const [separateSheets, setSeparateSheets] = useState(false);
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = async (f: File) => {
    setError(null);
    setSuccess(false);
    if (!f.name.endsWith('.xlsx') && !f.name.endsWith('.xls')) {
      setError("Please select a valid Excel file (.xlsx, .xls)");
      return;
    }
    setFile(f);
    await analyzeFile(f);
  };

  const analyzeFile = async (f: File) => {
    setAnalyzing(true);
    const formData = new FormData();
    formData.append('file', f);
    try {
      const res = await fetch('/api/preview', { method: 'POST', body: formData });
      if (!res.ok) throw new Error("Failed to load preview");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSheetsInfo(data.sheets || []);
      const initialConfig: Record<string, SheetConfig> = {};
      (data.sheets || []).forEach((s: SheetInfo) => {
        initialConfig[s.name] = { selected: true, widths: s.columns.map(() => 1) };
      });
      setSheetsConfig(initialConfig);
      if (data.sheets && data.sheets.length > 0) {
        setExpandedSheet(data.sheets[0].name);
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze Excel file. Please try again.");
      setFile(null); // Reset on fail
    } finally {
      setAnalyzing(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setSuccess(false);
    setError(null);
    setSheetsInfo([]);
    setSheetsConfig({});
  };

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    
    const selectedSheetNames = sheetsInfo.filter(s => sheetsConfig[s.name].selected).map(s => s.name);
    
    if (selectedSheetNames.length === 0) {
      setError("Please select at least one sheet to convert.");
      setLoading(false);
      return;
    }

    const columnWidthsConfig: Record<string, number[]> = {};
    sheetsInfo.forEach(s => {
      columnWidthsConfig[s.name] = sheetsConfig[s.name].widths;
    });

    const payload = {
      orientation,
      selectedSheets: selectedSheetNames,
      columnWidths: columnWidthsConfig
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('separate_sheets', separateSheets.toString());
    formData.append('config', JSON.stringify(payload));

    try {
      const response = await fetch('/api/convert', { method: 'POST', body: formData });
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

  const toggleSheetSelected = (sheetName: string, selected: boolean) => {
    setSheetsConfig(prev => ({
      ...prev,
      [sheetName]: { ...prev[sheetName], selected }
    }));
  };

  const updateColumnWidth = (sheetName: string, idx: number, val: number) => {
    setSheetsConfig(prev => {
      const newWidths = [...prev[sheetName].widths];
      newWidths[idx] = Math.max(0.1, val);
      return { ...prev, [sheetName]: { ...prev[sheetName], widths: newWidths }};
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-colors duration-500">
      <div className="absolute top-4 right-4 z-50">
        <button onClick={toggleDarkMode} className="p-3 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md shadow-md text-slate-800 dark:text-slate-200 hover:scale-110 transition-transform">
          {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 dark:bg-indigo-600/20 blur-3xl transition-colors duration-500" />
          <div className="absolute bottom-[10%] -right-[10%] w-[30%] h-[30%] rounded-full bg-purple-200/40 dark:bg-fuchsia-600/20 blur-3xl transition-colors duration-500" />
      </div>

      <div className="z-10 w-full max-w-4xl p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-2xl rounded-3xl transition-colors duration-500">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-fuchsia-400">
            XceleratePDF
          </h1>
          <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
            Batch convert multi-sheet Excel files into high-quality PDFs with precise formatting.
          </p>
        </div>

        {!file && !analyzing ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-indigo-100 dark:border-slate-700 rounded-2xl bg-indigo-50/30 dark:bg-slate-800/30 hover:bg-indigo-50/80 dark:hover:bg-slate-800/80 transition-all cursor-pointer group"
            onClick={() => document.getElementById('fileUpload')?.click()}
          >
            <div className="p-4 bg-white dark:bg-slate-800 rounded-full shadow-sm mb-4 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
            </div>
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">
              Click or drag your Excel file here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Supports .xlsx and .xls
            </p>
            <input
              id="fileUpload"
              type="file"
              className="hidden"
              accept=".xlsx,.xls"
              onChange={handleChange}
            />
            <button className="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white font-medium rounded-full hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-200 dark:shadow-none">
              Select File
            </button>
          </div>
        ) : analyzing ? (
          <div className="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
            <p className="text-xl font-semibold text-slate-700 dark:text-slate-300">Analyzing Workbook...</p>
          </div>
        ) : (
          <div className="flex flex-col w-full animate-in fade-in zoom-in duration-300">
            {/* File Info Header */}
            <div className="flex items-center justify-between w-full p-4 mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-indigo-100 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-indigo-100 dark:bg-slate-700 rounded-lg">
                  <FileType className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{file?.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{((file?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              {!loading && !success && (
                <button onClick={resetState} className="text-sm font-medium text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors">
                  Change File
                </button>
              )}
            </div>

            {/* Config & Preview Section */}
            {!loading && !success && sheetsInfo.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                
                {/* Left Sidebar Config */}
                <div className="flex flex-col gap-4 md:col-span-1">
                  
                  {/* Settings Panel */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-indigo-50 dark:border-slate-700 shadow-sm flex flex-col gap-5">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                      <Settings className="w-4 h-4" /> Options
                    </h3>
                    
                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Format</label>
                      <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                        <input
                          type="checkbox"
                          id="separateSheets"
                          checked={separateSheets}
                          onChange={(e) => setSeparateSheets(e.target.checked)}
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                        />
                        <label htmlFor="separateSheets" className="text-sm text-gray-700 dark:text-gray-300 font-medium cursor-pointer select-none">
                          Separate sheets to ZIP
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Orientation</label>
                      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
                        <button 
                          onClick={() => setOrientation('landscape')}
                          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${orientation === 'landscape' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                          Landscape
                        </button>
                        <button 
                          onClick={() => setOrientation('portrait')}
                          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${orientation === 'portrait' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                        >
                          Portrait
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sheet Selector */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-indigo-50 dark:border-slate-700 shadow-sm flex flex-col gap-3">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-2">
                      <Layout className="w-4 h-4" /> Sheets Setup
                    </h3>
                    <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                      {sheetsInfo.map((sheet) => (
                        <div key={sheet.name} className={`flex items-center gap-3 p-2 rounded-lg border transition-all ${expandedSheet === sheet.name ? 'bg-indigo-50 dark:bg-slate-700 border-indigo-200 dark:border-slate-600' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                          <input
                            type="checkbox"
                            checked={sheetsConfig[sheet.name]?.selected || false}
                            onChange={(e) => toggleSheetSelected(sheet.name, e.target.checked)}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                          />
                          <button 
                            className="flex-1 text-left text-sm font-medium text-slate-700 dark:text-slate-200 truncate"
                            onClick={() => setExpandedSheet(sheet.name)}
                          >
                            {sheet.name}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Main Preview */}
                <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-indigo-50 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                  {expandedSheet && sheetsInfo.find(s => s.name === expandedSheet) ? (
                    <>
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                          <TableIcon className="w-5 h-5 text-indigo-500 dark:text-indigo-400" /> Preview: {expandedSheet}
                        </h3>
                      </div>
                      
                      {/* Column Width Adjusters */}
                      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-x-auto custom-scrollbar">
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Relative Column Ratios</p>
                        <div className="flex gap-2 pb-2">
                          {sheetsInfo.find(s => s.name === expandedSheet)!.columns.map((col, idx) => (
                            <div key={idx} className="flex flex-col gap-1 min-w-[80px] flex-1">
                              <label className="text-[10px] font-medium text-slate-600 dark:text-slate-300 truncate" title={col}>{col}</label>
                              <input 
                                type="number" 
                                min="0.1" 
                                step="0.1"
                                className="w-full text-xs p-1.5 border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={sheetsConfig[expandedSheet]?.widths[idx] || 1}
                                onChange={(e) => updateColumnWidth(expandedSheet, idx, parseFloat(e.target.value) || 1)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Data Table Preview */}
                      <div className="p-0 overflow-x-auto overflow-y-auto max-h-[300px] flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-max">
                          <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 shadow-sm z-10">
                            <tr>
                              {sheetsInfo.find(s => s.name === expandedSheet)!.columns.map((col, idx) => (
                                <th key={idx} className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider whitespace-nowrap">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
                            {sheetsInfo.find(s => s.name === expandedSheet)!.preview.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                            {sheetsInfo.find(s => s.name === expandedSheet)!.preview.length === 0 && (
                              <tr>
                                <td colSpan={sheetsInfo.find(s => s.name === expandedSheet)!.columns.length} className="px-4 py-8 text-center text-slate-500 text-sm">
                                  Empty Sheet
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">Select a sheet to preview</div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 mb-6 w-full text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {success ? (
              <div className="flex flex-col items-center justify-center p-8 w-full border border-green-200 dark:border-green-800/50 bg-green-50 dark:bg-green-900/20 rounded-2xl">
                <CheckCircle2 className="w-12 h-12 text-green-500 dark:text-green-400 mb-4" />
                <p className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">Conversion Complete!</p>
                <p className="text-sm text-green-600 dark:text-green-400 mb-6 text-center">Your PDF has been downloaded successfully.</p>
                <button
                  onClick={resetState}
                  className="px-6 py-2.5 bg-green-600 dark:bg-green-500 text-white font-medium rounded-full hover:bg-green-700 dark:hover:bg-green-600 transition-colors shadow-md"
                >
                  Convert Another File
                </button>
              </div>
            ) : (
              !analyzing && (
                <button
                  onClick={handleConvert}
                  disabled={loading}
                  className={`w-full py-3.5 px-6 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                    loading 
                      ? 'bg-indigo-400 dark:bg-indigo-500/50 cursor-not-allowed shadow-none' 
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-500 dark:to-fuchsia-600 shadow-indigo-300 dark:shadow-indigo-900/50 hover:shadow-indigo-400 hover:-translate-y-0.5'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    'Export to PDF'
                  )}
                </button>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}
