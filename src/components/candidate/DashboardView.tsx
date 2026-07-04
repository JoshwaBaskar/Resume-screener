import React from "react";
import { motion } from "framer-motion";
import { Award, TrendingUp, CheckCircle, FileText, UploadCloud, FileCheck } from "lucide-react";
import { ResumeData, JobMatchReport, JobDescription } from "../../types";

interface DashboardViewProps {
  resume: ResumeData | null;
  matchedReports: JobMatchReport[];
  jobs: JobDescription[];
  downloadTextReport: () => void;
}

export default function DashboardView({
  resume,
  matchedReports,
  jobs,
  downloadTextReport
}: DashboardViewProps) {
  const avgMatchScore = matchedReports.length > 0
    ? Math.round(matchedReports.reduce((sum, r) => sum + r.matchScore, 0) / matchedReports.length)
    : null;
  const bestMatchScore = matchedReports.length > 0
    ? Math.max(...matchedReports.map(r => r.matchScore))
    : null;
  const shortlistedCount = matchedReports.filter(r => r.status === "shortlisted").length;
  const totalSkillsCount = resume
    ? (resume.skills?.length || 0) + (resume.technologies?.length || 0) + (resume.softSkills?.length || 0)
    : 0;

  return (
    <div className="space-y-8" id="candidate-dashboard-view">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
            Candidate Workspace
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Analyze your qualification profile against enterprise role listings
          </p>
        </div>
        {resume && (
          <button
            onClick={downloadTextReport}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-950 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            id="download-ats-report-btn"
          >
            <FileCheck className="w-4 h-4 text-blue-600" />
            Download ATS Report
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="candidate-metrics-grid">
        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between shadow-sm group transition-all duration-300"
        >
          <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-all duration-300 pointer-events-none" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-sans">
                ATS Score
              </span>
              <span className="text-3xl font-bold font-display text-slate-900 tracking-tight mt-2 block">
                {resume ? `${resume.atsScore}%` : "N/A"}
              </span>
            </div>
            <div className={`p-2.5 rounded-xl border ${resume ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            {resume ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-semibold">Score Rating:</span>
                  <span className={`font-bold ${resume.atsScore >= 80 ? "text-emerald-600" : resume.atsScore >= 60 ? "text-amber-600" : "text-red-600"}`}>
                    {resume.atsScore >= 80 ? "Optimized" : resume.atsScore >= 60 ? "Good" : "Needs Review"}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      resume.atsScore >= 80 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : 
                      resume.atsScore >= 60 ? "bg-gradient-to-r from-amber-500 to-orange-400" : 
                      "bg-gradient-to-r from-red-500 to-rose-400"
                    }`}
                    style={{ width: `${resume.atsScore}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">No resume uploaded</p>
            )}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between shadow-sm group transition-all duration-300"
        >
          <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all duration-300 pointer-events-none" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-sans">
                Role Match Score
              </span>
              <span className="text-3xl font-bold font-display text-slate-900 tracking-tight mt-2 block">
                {avgMatchScore !== null ? `${avgMatchScore}%` : "N/A"}
              </span>
            </div>
            <div className={`p-2.5 rounded-xl border ${avgMatchScore !== null ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            {bestMatchScore !== null ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-semibold">Peak Compatibility:</span>
                  <span className="font-bold text-blue-600 font-mono">{bestMatchScore}% Max</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-500"
                    style={{ width: `${avgMatchScore || 0}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">Awaiting role matches</p>
            )}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between shadow-sm group transition-all duration-300"
        >
          <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-indigo-500/5 blur-3xl group-hover:bg-indigo-500/10 transition-all duration-300 pointer-events-none" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-sans">
                Profile Skill Strength
              </span>
              <span className="text-3xl font-bold font-display text-slate-900 tracking-tight mt-2 block">
                {totalSkillsCount}
              </span>
            </div>
            <div className={`p-2.5 rounded-xl border ${totalSkillsCount > 0 ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            {resume ? (
              <div className="flex flex-wrap gap-1.5 max-h-[1.5rem] overflow-hidden">
                {(resume.skills || []).slice(0, 3).map((s, i) => (
                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-600 font-mono font-semibold">
                    {s}
                  </span>
                ))}
                {(resume.skills || []).length > 3 && (
                  <span className="text-[9px] px-1.5 py-0.5 text-slate-400 font-mono font-semibold">
                    +{(resume.skills || []).length - 3}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">No skills extracted</p>
            )}
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4, scale: 1.01 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between shadow-sm group transition-all duration-300"
        >
          <div className="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-amber-500/5 blur-3xl group-hover:bg-amber-500/10 transition-all duration-300 pointer-events-none" />
          <div className="flex items-start justify-between">
            <div>
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block font-sans">
                Active Alignments
              </span>
              <span className="text-3xl font-bold font-display text-slate-900 tracking-tight mt-2 block">
                {matchedReports.length}
              </span>
            </div>
            <div className={`p-2.5 rounded-xl border ${matchedReports.length > 0 ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-slate-100 border-slate-200 text-slate-400"}`}>
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100">
            {matchedReports.length > 0 ? (
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500">Shortlisted Pipeline:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {shortlistedCount} roles
                </span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 italic">No matched listings yet</p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-blue-600" />
              Active Job Alignment Rankings
            </h3>
            {!resume ? (
              <div className="text-center py-10">
                <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2 animate-bounce" />
                <p className="text-slate-500 text-xs">Please upload your resume to start scoring matches.</p>
              </div>
            ) : matchedReports.length === 0 ? (
              <p className="text-slate-500 text-xs py-8 text-center">No active postings matching your profile at this time.</p>
            ) : (
              <div className="space-y-4">
                {matchedReports.map((rep) => {
                  const job = jobs.find(j => j.id === rep.jobId);
                  return (
                    <div
                      key={rep.id}
                      className="bg-slate-50 p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-all"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {job?.title || "Unknown Job Title"}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {job?.company} • {job?.location}
                        </p>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mt-2 ${
                          rep.status === "shortlisted" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                          rep.status === "rejected" ? "bg-red-50 text-red-600 border border-red-200" : "bg-slate-200 text-slate-700"
                        }`}>
                          {rep.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono text-slate-400 font-medium">Match Accuracy</span>
                        <div className="flex items-center gap-2 mt-1 justify-end">
                          <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${rep.matchScore}%` }} />
                          </div>
                          <span className="text-xs font-bold font-mono text-slate-800">{rep.matchScore}%</span>
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-1">Confidence: {rep.confidenceScore}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4">
            Your Checklist
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${resume ? "text-emerald-500" : "text-slate-300"}`} />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Upload Resume</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Parse details and compute initial structure.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${resume ? "text-emerald-500" : "text-slate-300"}`} />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Review ATS Improvements</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Review spelling, layout, and gap metrics.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 text-slate-300`} />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Generate Tailored QA Answers</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Solve AI technical, HR, and scenario prompts.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 text-slate-300`} />
              <div>
                <h4 className="text-xs font-bold text-slate-800">Initiate Personalized Upskilling</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Use curated roadmaps, courses, and certifications.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
