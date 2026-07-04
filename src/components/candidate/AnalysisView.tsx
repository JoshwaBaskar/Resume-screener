import React from "react";
import { FileText, CheckCircle, AlertCircle } from "lucide-react";
import { ResumeData } from "../../types";
import SkillTrendChart from "../SkillTrendChart";

interface AnalysisViewProps {
  resume: ResumeData | null;
}

export default function AnalysisView({ resume }: AnalysisViewProps) {
  if (!resume) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm" id="no-resume-alert">
        <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-800">No Active Resume Found</h2>
        <p className="text-slate-500 text-xs mt-2 max-w-sm mx-auto">
          Please navigate to the "Upload & Parse Resume" workspace to parse your professional CV profile with Gemini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="candidate-analysis-view">
      <div>
        <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
          AI Resume Analysis
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Complete structural extraction, compliance suggestions, and ATS score breakdown
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Overall ATS Compliance
          </h3>
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="64" stroke="currentColor" className="text-slate-100" strokeWidth="8" fill="transparent" />
              <circle cx="72" cy="72" r="64" stroke="currentColor" className="text-blue-600 transition-all" strokeWidth="8" strokeDasharray={402} strokeDashoffset={402 - (402 * resume.atsScore) / 100} strokeLinecap="round" fill="transparent" />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black text-slate-900 font-mono block">
                {resume.atsScore}%
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase mt-0.5 block">
                Rating
              </span>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-6 leading-relaxed">
            Based on document grammar density, core action verbs, project structures, and contact fields.
          </p>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Profile Summary
          </h3>
          <p className="text-slate-600 text-xs leading-relaxed font-sans">
            {resume.professionalSummary}
          </p>

          <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Email Address</span>
              <span className="text-xs text-slate-700 mt-1 block font-mono font-medium">{resume.email}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase block">Phone Contact</span>
              <span className="text-xs text-slate-700 mt-1 block font-mono font-medium">{resume.phone}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Extracted Strengths
          </h3>
          <ul className="space-y-3" id="extracted-strengths-list">
            {(resume.strengths || []).map((str, idx) => (
              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed font-medium">
                <span className="text-emerald-500 font-mono font-bold mt-0.5">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Constructive Weaknesses / Gaps
          </h3>
          <ul className="space-y-3" id="extracted-weaknesses-list">
            {(resume.weaknesses || []).map((weak, idx) => (
              <li key={idx} className="text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed font-medium">
                <span className="text-amber-500 font-mono font-bold mt-0.5">•</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">
          Parsed Skills & Stack Cloud
        </h3>
        <div className="flex flex-wrap gap-2" id="extracted-skills-cloud">
          {(resume.skills || []).map((skill, idx) => (
            <span key={`skill-${idx}`} className="bg-blue-50 text-blue-600 border border-blue-100 px-2.5 py-1 rounded text-xs font-bold">
              {skill}
            </span>
          ))}
          {(resume.technologies || []).map((tech, idx) => (
            <span key={`tech-${idx}`} className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded text-xs font-bold">
              {tech}
            </span>
          ))}
          {(resume.softSkills || []).map((soft, idx) => (
            <span key={`soft-${idx}`} className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded text-xs font-bold">
              {soft}
            </span>
          ))}
        </div>
      </div>

      <SkillTrendChart resume={resume} />

      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">
          ATS Improvement Suggestions
        </h3>
        <div className="space-y-4" id="extracted-improvements-list">
          {(resume.improvementSuggestions || []).map((imp, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-xs flex items-center justify-center font-bold mt-0.5 font-mono">
                {idx + 1}
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">{imp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
