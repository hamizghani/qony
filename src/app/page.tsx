"use client";

import { useState, useRef } from "react";
import ConsultantWhiteboard, { AnalysisResult } from "@/components/ConsultantWhiteboard"; // Import from the previous component file
import { Loader2, UploadCloud, FileText, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { Download } from "lucide-react";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => <button className="px-4 py-2 bg-gray-200 rounded text-gray-500">Loading PDF...</button>,
  }
);

import ConsultantDeckPDF from "@/components/ConsultantDeckPDF";
export default function Home() {
  const [status, setStatus] = useState<"idle" | "uploading" | "processing" | "done" | "error">("idle");
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("processing");
      
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze PDF");
      }

      const result: AnalysisResult = await response.json();
      setData(result);
      setStatus("done");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <main className="flex h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-4">
  {status === "done" && data && (
    <PDFDownloadLink
      document={<ConsultantDeckPDF data={data} />}
      fileName="Consultant_Analysis_Deck.pdf"
    >
      {({ loading }) => (
        <button
          disabled={loading}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          <Download className="w-4 h-4" />
          {loading ? "Generating Deck..." : "Export to PDF Deck"}
        </button>
      )}
    </PDFDownloadLink>
  )}
  
  {status === "done" && (
    <button
      onClick={() => {
        setStatus("idle");
        setData(null);
        setFileName("");
      }}
      className="text-sm text-slate-500 hover:text-blue-600 font-medium"
    >
      New Analysis
    </button>
  )}
</div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        
        {/* State: Idle (Upload Screen) */}
        {status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 p-4">
            <div 
              onClick={triggerFileInput}
              className="cursor-pointer group text-center p-12 border-2 border-dashed border-slate-300 rounded-xl bg-white max-w-lg w-full transition-all hover:border-blue-500 hover:shadow-xl"
            >
              <input 
                type="file" 
                accept="application/pdf" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
              />
              <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Upload Consultant Report</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Upload a PDF case study or financial report.<br/>
                Our AI will extract the OCR text and build a logic tree.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full shadow-lg transition-all active:scale-95">
                Choose PDF File
              </button>
            </div>
          </div>
        )}

        {/* State: Processing / Loading */}
        {(status === "uploading" || status === "processing") && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20">
            <div className="relative">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-white p-4 rounded-full shadow-lg border border-slate-100">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mt-6">
              {status === "uploading" ? "Reading PDF..." : "Consultant AI is Thinking..."}
            </h3>
            <p className="text-slate-500 mt-2 max-w-xs text-center">
              {fileName && <span className="block mb-2 text-xs font-mono bg-slate-100 py-1 px-2 rounded text-slate-600">{fileName}</span>}
              {status === "uploading" 
                ? "Extracting text content from your document." 
                : "Analyzing problem statements, hypotheses, and evidence."}
            </p>
          </div>
        )}

        {/* State: Error */}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
             <div className="text-center max-w-md">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-red-700">Analysis Failed</h3>
                <p className="text-red-600 mt-2">
                    Something went wrong while processing the PDF. Please check your API Key or try a different file.
                </p>
                <button 
                    onClick={() => setStatus('idle')}
                    className="mt-6 text-sm font-bold text-red-700 hover:underline"
                >
                    Try Again
                </button>
             </div>
          </div>
        )}

        {/* State: Done (Render Whiteboard) */}
        {status === "done" && data && (
          <ConsultantWhiteboard data={data} />
        )}
      </div>
    </main>
  );
}