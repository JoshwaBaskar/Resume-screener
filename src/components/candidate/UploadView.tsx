import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { UploadCloud, CheckCircle, FileText } from "lucide-react";
import { ResumeData } from "../../types";
import { api } from "../../services/api";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface UploadViewProps {
  apiClient: typeof api;
  resume: ResumeData | null;
  setResume: (res: ResumeData | null) => void;
  fetchResumeAndReports: () => Promise<void>;
}

export default function UploadView({
  apiClient,
  resume,
  setResume,
  fetchResumeAndReports,
}: UploadViewProps) {
  const [pasteText, setPasteText] = useState("");
  const [fileName, setFileName] = useState("resume.txt");
  const [uploadStep, setUploadStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Use ref to store the interval so we can clear it on unmount
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
      setFileName(file.name);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          fullText += pageText + "\n";
        }
        await uploadResumeContent(fullText, file.name);
      } catch (err: any) {
        setUploadError("Failed to parse PDF file.");
      }
      return;
    }

    if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx")) {
      setFileName(file.name);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        await uploadResumeContent(result.value, file.name);
      } catch (err: any) {
        setUploadError("Failed to parse DOCX file.");
      }
      return;
    }

    if (file.type !== "text/plain" && !file.name.toLowerCase().endsWith(".txt")) {
      setUploadError("Only .txt, .pdf, and .docx files are supported.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target?.result as string;
      await uploadResumeContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const uploadResumeContent = async (text: string, name: string) => {
    setUploading(true);
    setUploadError(null);
    setUploadStep(1);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setUploadStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 1200);

    try {
      const parsed = await apiClient.uploadResume(text, name);
      if (timerRef.current) clearInterval(timerRef.current);
      setUploadStep(4);
      setResume(parsed);
      await fetchResumeAndReports();
    } catch (err: any) {
      if (timerRef.current) clearInterval(timerRef.current);
      setUploadError(err.message || "Failed to analyze resume.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!confirm("Are you sure you want to delete your active resume? All associated matching reports will be removed.")) return;
    try {
      await apiClient.deleteResume();
      setResume(null);
      // Wait for orchestrator to handle cascading state reset
    } catch (err: any) {
      alert(err.message || "Error deleting resume.");
    }
  };

  return (
    <div className="space-y-8" id="candidate-upload-view">
      <div>
        <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
          Upload & Parse Resume
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Upload your resume or paste the text directly. Gemini will parse it with zero hallucination.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">
              Upload Document
            </h3>
            
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-500/50 rounded-xl p-8 text-center bg-slate-50/50 cursor-pointer transition-all relative group">
              <input
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="resume-file-input"
                disabled={uploading}
              />
              <UploadCloud className="w-12 h-12 text-slate-400 group-hover:text-blue-600 mx-auto mb-3 transition-all" />
              <h4 className="text-xs font-bold text-slate-800">
                Drag & Drop Resume
              </h4>
              <p className="text-[10px] text-slate-500 mt-1">
                Supported formats: TXT, PDF, DOCX. Max size 10MB
              </p>
              {fileName && (
                <span className="inline-block mt-3 bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-1 rounded border border-slate-200">
                  Selected: {fileName}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 text-xs text-slate-500 border-t border-slate-100 pt-4">
            <span className="font-bold block text-slate-700 mb-1">Direct Parser Engine</span>
            We extract complete profile details including education history, projects, certifications, soft skills, and tech stacks automatically.
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">
              Paste Plain Text Resume
            </h3>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste your full text resume here..."
              rows={8}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs font-mono resize-none transition-all"
              id="resume-text-textarea"
              disabled={uploading}
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => uploadResumeContent(pasteText, "Pasted_Resume_Text.txt")}
              disabled={!pasteText.trim() || uploading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-lg transition-all shadow-sm"
              id="parse-resume-btn"
            >
              Start AI Analysis
            </button>
          </div>
        </div>
      </div>

      {uploading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xl max-w-xl mx-auto"
          id="upload-loading-overlay"
        >
          <h3 className="text-xs font-bold text-slate-800 mb-4 flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Parsing with the Google Gemini API...
          </h3>
          <div className="space-y-3">
            {[
              "1. Reading raw resume content bytes...",
              "2. Validating text structure and density...",
              "3. Mapping components through Gemini extraction...",
              "4. Scoring compliance schemas and running ATS audits..."
            ].map((stepText, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${uploadStep > idx ? "bg-emerald-500" : uploadStep === idx ? "bg-blue-500 animate-pulse" : "bg-slate-200"}`} />
                <span className={`text-[11px] ${uploadStep > idx ? "text-slate-700 font-semibold" : uploadStep === idx ? "text-blue-600 font-semibold" : "text-slate-400"}`}>
                  {stepText}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {uploadError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-600 text-xs text-center max-w-xl mx-auto font-semibold" id="upload-error-banner">
          {uploadError}
        </div>
      )}

      {resume && !uploading && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl max-w-xl mx-auto text-center shadow-sm" id="upload-success-card">
          <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">
            Active Resume: {resume.fullName}
          </h3>
          <p className="text-slate-500 text-xs mt-1">
            Resume parsed successfully! The overall ATS rating is <span className="text-emerald-600 font-bold font-mono">{resume.atsScore}%</span>. Review the analysis sections below.
          </p>
          <button
            onClick={handleDeleteResume}
            className="mt-4 px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg text-[10px] font-bold transition-all"
            id="delete-resume-btn"
          >
            Delete / Re-upload Resume
          </button>
        </div>
      )}
    </div>
  );
}
