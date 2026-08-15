"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Loader2, AlertCircle } from "lucide-react";

export default function PitchDeckUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError("");
      } else {
        setError("Please upload a PDF file.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${API_URL}/api/startups/upload_pitch_deck`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("AI Extraction failed. Please try again or fill manually.");
      }

      const data = await response.json();
      localStorage.setItem("extractedProfile", JSON.stringify(data));
      router.push("/startup/profile");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black tracking-tight text-[#1C1917] mb-3">Upload Pitch Deck</h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Upload your PDF pitch deck and MatchFlow AI will automatically extract your company profile for investors.
        </p>
      </div>

      <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
            file 
              ? "border-amber-400 bg-amber-500/5" 
              : "border-white/80 hover:border-amber-400 hover:bg-white/50"
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          
          {file ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 shadow-sm border border-amber-200">
                <FileText className="w-8 h-8 text-amber-600" />
              </div>
              <p className="font-bold text-[#1C1917] text-lg">{file.name}</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <Button 
                variant="ghost" 
                onClick={(e) => { e.stopPropagation(); setFile(null); }} 
                className="text-red-500 hover:bg-red-50 hover:text-red-600 mt-4 font-semibold"
              >
                Remove File
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                <UploadCloud className="w-8 h-8 text-slate-400" />
              </div>
              <p className="font-bold text-[#1C1917] text-lg mb-1">Click or drag and drop to upload</p>
              <p className="text-sm text-slate-500 font-medium">PDF up to 10MB</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!file || loading} 
          className="w-full mt-8 h-14 rounded-xl font-bold text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-amber-500/25 transition-all text-white border-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            "Analyze with AI"
          )}
        </Button>
      </div>
    </div>
  );
}
