"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
      const response = await fetch("http://localhost:8000/api/startups/upload_pitch_deck", {
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
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">Upload Pitch Deck</h1>
        <p className="text-muted-foreground">
          Upload your PDF pitch deck and MatchFlow AI will automatically extract your company profile for investors.
        </p>
      </div>

      {/* Progression Bar */}
      <div className="flex items-center gap-2 mb-8">
        <div className="flex-1 h-2 bg-primary rounded-full"></div>
        <div className="flex-1 h-2 bg-secondary rounded-full"></div>
        <div className="flex-1 h-2 bg-secondary rounded-full"></div>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
              file ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-secondary/50"
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
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <p className="font-semibold text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <Button variant="link" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-danger mt-2">
                  Remove File
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-semibold text-foreground mb-1">Click or drag and drop to upload</p>
                <p className="text-sm text-muted-foreground">PDF up to 10MB</p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-6 p-4 bg-danger/10 text-danger rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={!file || loading} 
            className="w-full mt-8 h-12 text-base font-semibold"
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
        </CardContent>
      </Card>
    </div>
  );
}
