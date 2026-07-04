import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Users,
  Briefcase,
  Search,
  MessageSquare,
  TrendingUp,
  Plus,
  Trash2,
  Mail,
  FileCheck,
  CheckCircle,
  XCircle,
  HelpCircle,
  Send,
  Loader2,
  AlertCircle,
  Check,
  Copy,
  ChevronRight,
  Filter,
  ArrowRightLeft
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { JobDescription, JobMatchReport, UserRole } from "../types";

const COLORS = ["#10b981", "#3b82f6", "#6366f1", "#ef4444"];

interface RecruiterDashboardProps {
  activeTab: string;
  apiClient: any;
  jobs: JobDescription[];
  setJobs: (jobs: JobDescription[]) => void;
}

export default function RecruiterDashboard({
  activeTab,
  apiClient,
  jobs,
  setJobs
}: RecruiterDashboardProps) {
  // Common states
  const [loading, setLoading] = useState(false);
  const [rankingStats, setRankingStats] = useState<any>(null);

  // Job Listing states
  const [showAddJob, setShowAddJob] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobCompany, setNewJobCompany] = useState("");
  const [newJobLocation, setNewJobLocation] = useState("");
  const [newJobDept, setNewJobDept] = useState("");
  const [newJobExp, setNewJobExp] = useState("Mid-level (3+ years)");
  const [newJobDesc, setNewJobDesc] = useState("");
  const [newJobSkills, setNewJobSkills] = useState("");
  const [newJobReqs, setNewJobReqs] = useState("");

  // Matching & Screening States
  const [selectedJobId, setSelectedJobId] = useState("");
  const [candidatesList, setCandidatesList] = useState<JobMatchReport[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<JobMatchReport | null>(null);

  // Email draft states
  const [interviewDetails, setInterviewDetails] = useState("Monday at 10:00 AM on Google Meet");
  const [draftingEmail, setDraftingEmail] = useState(false);
  const [draftedEmail, setDraftedEmail] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Bulk uploading states
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);

  // Chatbot states
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Side-by-side Candidate comparison states
  const [showComparison, setShowComparison] = useState(false);
  const [compCand1, setCompCand1] = useState<JobMatchReport | null>(null);
  const [compCand2, setCompCand2] = useState<JobMatchReport | null>(null);

  useEffect(() => {
    fetchDashboardStats();
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs]);

  useEffect(() => {
    if (selectedJobId) {
      fetchCandidatesForJob(selectedJobId);
    }
  }, [selectedJobId]);

  const fetchDashboardStats = async () => {
    try {
      const stats = await apiClient.fetchRanking();
      setRankingStats(stats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCandidatesForJob = async (jobId: string) => {
    setLoading(true);
    try {
      const candidates = await apiClient.fetchTopCandidates(jobId);
      setCandidatesList(candidates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: newJobTitle,
        company: newJobCompany,
        location: newJobLocation,
        department: newJobDept,
        experienceLevel: newJobExp,
        description: newJobDesc,
        requirements: newJobReqs.split(",").map(r => r.trim()).filter(Boolean),
        skillsRequired: newJobSkills.split(",").map(s => s.trim()).filter(Boolean),
      };

      const job = await apiClient.createJob(payload);
      setJobs([...jobs, job]);
      setSelectedJobId(job.id);
      
      // Reset form
      setNewJobTitle("");
      setNewJobCompany("");
      setNewJobLocation("");
      setNewJobDept("");
      setNewJobDesc("");
      setNewJobSkills("");
      setNewJobReqs("");
      setShowAddJob(false);
      
      fetchDashboardStats();
    } catch (err: any) {
      alert(err.message || "Error creating job");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job listing? This will also remove all associated candidate match reports.")) return;
    try {
      await apiClient.deleteJob(jobId);
      const updated = jobs.filter(j => j.id !== jobId);
      setJobs(updated);
      if (selectedJobId === jobId) {
        setSelectedJobId(updated[0]?.id || "");
      }
      fetchDashboardStats();
    } catch (err: any) {
      alert(err.message || "Error deleting job");
    }
  };

  const handleStatusUpdate = async (reportId: string, status: "shortlisted" | "rejected") => {
    try {
      const updated = await apiClient.updateMatchStatus(reportId, status);
      
      // Update candidates list
      setCandidatesList(prev => prev.map(c => c.id === reportId ? { ...c, status } : c));
      
      // If modal is open, update selected report
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport(prev => prev ? { ...prev, status } : null);
      }
      fetchDashboardStats();
    } catch (err: any) {
      alert(err.message || "Error updating status");
    }
  };

  const handleDraftEmail = async () => {
    if (!selectedReport) return;
    setDraftingEmail(true);
    setDraftedEmail(null);
    try {
      const data = await apiClient.generateEmail(selectedReport.id, interviewDetails);
      setDraftedEmail(data.email);
    } catch (err) {
      console.error(err);
    } finally {
      setDraftingEmail(false);
    }
  };

  const handleCopyEmail = () => {
    if (!draftedEmail) return;
    navigator.clipboard.writeText(draftedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBulkUpload = async () => {
    if (!bulkData.trim()) return;
    setLoading(true);
    setBulkStatus("Analyzing & screening resumes in bulk... Please wait.");
    try {
      // Parse data into structured array of resumes
      // Simple parse: Split by custom divider e.g. "=== RESUME ==="
      const textChunks = bulkData.split("=== RESUME ===");
      const resumesList = textChunks
        .map(chunk => {
          const lines = chunk.trim().split("\n");
          const nameLine = lines.find(l => l.toLowerCase().startsWith("name:"));
          const name = nameLine ? nameLine.split(":")[1]?.trim() : "Bulk Candidate";
          return {
            name,
            text: chunk.trim(),
            fileName: `${name.replace(/\s+/g, "_")}_CV.txt`
          };
        })
        .filter(item => item.text.length > 20);

      if (resumesList.length === 0) {
        throw new Error("Could not find any resumes. Please use '=== RESUME ===' as separator.");
      }

      await apiClient.bulkUpload(resumesList);
      setBulkStatus(`Successfully uploaded and parsed ${resumesList.length} candidate profiles in parallel!`);
      setBulkData("");
      
      // Refresh
      if (selectedJobId) {
        fetchCandidatesForJob(selectedJobId);
      }
      fetchDashboardStats();
    } catch (err: any) {
      setBulkStatus(`Bulk screening failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userMsg = { role: "user", text: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage("");
    setChatLoading(true);

    try {
      const data = await apiClient.chatBot(userMsg.text, chatHistory);
      setChatHistory(prev => [...prev, { role: "model", text: data.response }]);
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [...prev, { role: "model", text: "I encountered an error querying the candidate index. Please verify your connection." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Filters application
  const filteredCandidates = candidatesList.filter(cand => {
    const matchesSearch = cand.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cand.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesScore = true;
    if (scoreFilter === "high") matchesScore = cand.matchScore >= 80;
    else if (scoreFilter === "mid") matchesScore = cand.matchScore >= 60 && cand.matchScore < 80;
    else if (scoreFilter === "low") matchesScore = cand.matchScore < 60;

    let matchesStatus = true;
    if (statusFilter === "shortlisted") matchesStatus = cand.status === "shortlisted";
    else if (statusFilter === "rejected") matchesStatus = cand.status === "rejected";
    else if (statusFilter === "pending") matchesStatus = cand.status === "pending";

    return matchesSearch && matchesScore && matchesStatus;
  });

  if (activeTab === "dashboard") {
    if (!rankingStats) {
      return (
        <div className="text-center py-20" id="recruiter-dashboard-loader">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-xs">Loading analytics dashboard...</p>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-fade-in" id="recruiter-dashboard-view">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Recruitment Analytics
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Enterprise dashboard for candidate pipelines, average match scores, and skill distributions
          </p>
        </div>

        {/* Statistical Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Candidates</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1.5 block">{rankingStats.totalCandidates}</span>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Active Postings</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1.5 block">{rankingStats.totalJobs}</span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
              <Briefcase className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Avg Match Score</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1.5 block">{rankingStats.avgMatchScore}%</span>
            </div>
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
            <div>
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Screenings</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1.5 block">{rankingStats.totalReports}</span>
            </div>
            <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-purple-600">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top required skills distribution */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-6">
              Talent Skill Frequency Distribution
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankingStats.topSkills || []} margin={{ left: -10, right: 10, bottom: 0 }}>
                  <XAxis dataKey="skill" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "8px" }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]}>
                    {(rankingStats.topSkills || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#2563eb" : "#4f46e5"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Hiring Recommendations Pie Chart */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-6">
              Hiring Decision Distribution
            </h3>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rankingStats.recommendationDistribution || []}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(rankingStats.recommendationDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "8px" }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeTab === "jobs") {
    return (
      <div className="space-y-8" id="recruiter-jobs-view">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Job Postings
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Configure role guidelines to trigger automatic resume matching
            </p>
          </div>
          <button
            onClick={() => setShowAddJob(!showAddJob)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
            id="add-new-job-btn"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </button>
        </div>

        {/* Add Job Form */}
        {showAddJob && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            onSubmit={handleCreateJob}
            className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4"
            id="new-job-form"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Role Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Architect"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Company Entity</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google DeepMind"
                  value={newJobCompany}
                  onChange={(e) => setNewJobCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Location / Context</label>
                <input
                  type="text"
                  placeholder="e.g. Sunnyvale, CA"
                  value={newJobLocation}
                  onChange={(e) => setNewJobLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Systems Engineering"
                  value={newJobDept}
                  onChange={(e) => setNewJobDept(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Experience Expectations</label>
                <input
                  type="text"
                  placeholder="e.g. Senior (5+ years)"
                  value={newJobExp}
                  onChange={(e) => setNewJobExp(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1">Skills Required (Comma separated)</label>
              <input
                type="text"
                placeholder="React, TypeScript, GCP, Node.js"
                value={newJobSkills}
                onChange={(e) => setNewJobSkills(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1">Detailed Job Description</label>
              <textarea
                required
                rows={4}
                placeholder="Explain the role duties, key projects, and core responsibilities..."
                value={newJobDesc}
                onChange={(e) => setNewJobDesc(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1">Key Qualifications / Reqs (Comma separated)</label>
              <textarea
                rows={2}
                placeholder="BS in CS, Experience with Docker, Familiarity with GenAI"
                value={newJobReqs}
                onChange={(e) => setNewJobReqs(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddJob(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-lg transition-all"
              >
                {loading ? "Publishing..." : "Publish & Match"}
              </button>
            </div>
          </motion.form>
        )}

        {/* Jobs List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="job-posts-grid">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase font-mono tracking-wider">
                      {job.department}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{job.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{job.company} • {job.location}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg hover:bg-red-50 transition-all border border-slate-200"
                    id={`delete-job-${job.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-slate-600 text-xs line-clamp-3 mt-4 leading-relaxed font-sans">
                  {job.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {job.skillsRequired.slice(0, 5).map((skill, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                      {skill}
                    </span>
                  ))}
                  {job.skillsRequired.length > 5 && (
                    <span className="text-[10px] text-slate-500 font-bold self-center">
                      +{job.skillsRequired.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Posted on: {new Date(job.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => {
                    setSelectedJobId(job.id);
                    // trigger switch tab
                    const btn = document.getElementById("sidebar-tab-matching");
                    if (btn) btn.click();
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-all"
                >
                  Screen Candidates
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (activeTab === "matching") {
    return (
      <div className="space-y-8 animate-fade-in" id="recruiter-matching-view">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Candidate Screening & Ranking
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Top-K similarity ranking, duplicate validation, and shortlist workflows
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowBulkUpload(!showBulkUpload)}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-all"
              id="bulk-upload-trigger"
            >
              Bulk Upload Candidates
            </button>
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
              id="comparison-trigger"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
              Side-by-side Compare
            </button>
          </div>
        </div>

        {/* Bulk upload form */}
        {showBulkUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4"
            id="bulk-upload-form"
          >
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Bulk Resume Upload Sandbox
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Paste plain text resumes separated by the separator: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-blue-600">=== RESUME ===</code> on a new line. You must include a <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">Name: [Candidate Name]</code> field for each resume block.
            </p>
            <textarea
              rows={8}
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder={`Name: Jane Doe\nSkills: Python, SQL, Docker\n=== RESUME ===\nName: Marcus Aurelius\nSkills: Management, Philosophy, Roman Law`}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {bulkStatus && (
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-blue-600 text-xs">
                {bulkStatus}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBulkUpload(false)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-lg font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleBulkUpload}
                disabled={loading}
                className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-lg"
              >
                Start Bulk Extraction
              </button>
            </div>
          </motion.div>
        )}

        {/* Double Comparison Workspace */}
        {showComparison && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4"
            id="compare-candidates-workspace"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                Side-by-side Candidate Comparison
              </h3>
              <button
                onClick={() => setShowComparison(false)}
                className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                Close Workspace
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Candidate 1</label>
                <select
                  value={compCand1?.id || ""}
                  onChange={(e) => setCompCand1(candidatesList.find(c => c.id === e.target.value) || null)}
                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold px-3 py-2"
                >
                  <option value="">Select Candidate...</option>
                  {candidatesList.map(c => <option key={c.id} value={c.id}>{c.candidateName} ({c.matchScore}%)</option>)}
                </select>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1">Candidate 2</label>
                <select
                  value={compCand2?.id || ""}
                  onChange={(e) => setCompCand2(candidatesList.find(c => c.id === e.target.value) || null)}
                  className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold px-3 py-2"
                >
                  <option value="">Select Candidate...</option>
                  {candidatesList.map(c => <option key={c.id} value={c.id}>{c.candidateName} ({c.matchScore}%)</option>)}
                </select>
              </div>
            </div>

            {/* Comparison details panel */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {/* Cand 1 details */}
              <div className="space-y-4">
                {compCand1 ? (
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-800">{compCand1.candidateName}</h4>
                      <span className="text-xs font-mono font-bold text-blue-600">{compCand1.matchScore}% Fit</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Recommendation: <span className="text-emerald-600 font-semibold">{compCand1.hiringRecommendation}</span></p>
                    <div className="border-t border-slate-100 pt-2">
                      <span className="text-[9px] font-bold uppercase text-slate-400">Candidate Strengths:</span>
                      <ul className="text-[10px] text-slate-600 mt-1 list-disc pl-3.5 space-y-1">
                        {compCand1.strengths.slice(0, 2).map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs py-4 text-center border border-dashed border-slate-200 rounded-xl">No candidate selected</p>
                )}
              </div>

              {/* Cand 2 details */}
              <div className="space-y-4">
                {compCand2 ? (
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-800">{compCand2.candidateName}</h4>
                      <span className="text-xs font-mono font-bold text-blue-600">{compCand2.matchScore}% Fit</span>
                    </div>
                    <p className="text-[10px] text-slate-500">Recommendation: <span className="text-emerald-600 font-semibold">{compCand2.hiringRecommendation}</span></p>
                    <div className="border-t border-slate-100 pt-2">
                      <span className="text-[9px] font-bold uppercase text-slate-400">Candidate Strengths:</span>
                      <ul className="text-[10px] text-slate-600 mt-1 list-disc pl-3.5 space-y-1">
                        {compCand2.strengths.slice(0, 2).map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs py-4 text-center border border-dashed border-slate-200 rounded-xl">No candidate selected</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Screening Workspace Header (Select Job Post) */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider font-mono">Filter by Job Posting:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              id="recruiter-job-select"
            >
              <option value="">Select Job posting...</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.title} ({j.company})</option>)}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Search candidates or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs w-48 transition-all"
              />
            </div>

            {/* Score range select */}
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Scores</option>
              <option value="high">High fit (80%+)</option>
              <option value="mid">Mid fit (60%-80%)</option>
              <option value="low">Low fit (&lt;60%)</option>
            </select>

            {/* Status select */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Screening Candidates Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm" id="candidates-table-container">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Candidate Details</th>
                  <th className="py-4 px-6 text-center">Match Rating</th>
                  <th className="py-4 px-6">Required Skills Present</th>
                  <th className="py-4 px-6">Decision Outcome</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100" id="recruiter-candidates-tbody">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 text-xs font-semibold">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Screening candidate records...
                    </td>
                  </tr>
                ) : filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-xs leading-relaxed">
                      No candidates found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((cand) => (
                    <tr key={cand.id} className="hover:bg-slate-50/80 transition-all text-xs text-slate-600">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
                            {cand.candidateName[0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{cand.candidateName}</span>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">Matched on: {new Date(cand.matchedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-2">
                          <span className={`font-mono font-extrabold text-sm ${cand.matchScore >= 80 ? "text-emerald-600" : cand.matchScore >= 60 ? "text-blue-600" : "text-red-600"}`}>
                            {cand.matchScore}%
                          </span>
                          <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className={`h-1 ${cand.matchScore >= 80 ? "bg-emerald-500" : cand.matchScore >= 60 ? "bg-blue-500" : "bg-red-500"}`} style={{ width: `${cand.matchScore}%` }} />
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1 max-w-[260px]">
                          {cand.requiredSkills.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                              {s}
                            </span>
                          ))}
                          {cand.requiredSkills.length > 3 && (
                            <span className="text-[9px] text-slate-400 self-center">+{cand.requiredSkills.length - 3} more</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          cand.hiringRecommendation === "Strong Hire" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          cand.hiringRecommendation === "Hire" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                          cand.hiringRecommendation === "Shortlist" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-red-50 text-red-700 border border-red-100"
                        }`}>
                          {cand.hiringRecommendation}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => {
                              setSelectedReport(cand);
                              setDraftedEmail(null);
                             }}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-bold rounded shadow-xs"
                            id={`report-detail-btn-${cand.id}`}
                          >
                            Review AI Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed AI evaluation report Modal overlay */}
        {selectedReport && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto" id="report-modal">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col justify-between">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <div>
                  <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest block font-mono">Job Match Report</span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">{selectedReport.candidateName} Alignment</h3>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
                >
                  Close [ESC]
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh]">
                {/* Score Summary Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl text-center">
                    <span className="text-slate-500 text-[10px] font-bold uppercase">Match Accuracy</span>
                    <span className="text-2xl font-black text-blue-600 font-mono mt-1 block">{selectedReport.matchScore}%</span>
                  </div>
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl text-center">
                    <span className="text-slate-500 text-[10px] font-bold uppercase">Decision Recommendation</span>
                    <span className="text-sm font-extrabold text-slate-800 mt-1.5 block">{selectedReport.hiringRecommendation}</span>
                  </div>
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl text-center">
                    <span className="text-slate-500 text-[10px] font-bold uppercase">AI Confidence</span>
                    <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">{selectedReport.confidenceScore}%</span>
                  </div>
                </div>

                {/* Possessed and Missing skills grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 p-5 border border-slate-200 rounded-xl">
                    <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Required Skills Possessed
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedReport.requiredSkills.map((s, idx) => (
                        <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {s}
                        </span>
                      ))}
                      {selectedReport.requiredSkills.length === 0 && (
                        <p className="text-slate-500 text-[11px]">No matching required skills found.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-5 border border-slate-200 rounded-xl">
                    <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-500" />
                      Core Missing Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedReport.missingSkills.map((s, idx) => (
                        <span key={idx} className="bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded text-[10px] font-semibold">
                          {s}
                        </span>
                      ))}
                      {selectedReport.missingSkills.length === 0 && (
                        <p className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Zero skill deficits!
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Candidate detailed matching analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-3">AI Evaluation Strengths</h4>
                    <ul className="space-y-2 list-disc pl-3.5">
                      {selectedReport.strengths.map((str, idx) => (
                        <li key={idx} className="text-xs text-slate-600 leading-relaxed font-sans">{str}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-3">AI Evaluation Weaknesses</h4>
                    <ul className="space-y-2 list-disc pl-3.5">
                      {selectedReport.weaknesses.map((weak, idx) => (
                        <li key={idx} className="text-xs text-slate-600 leading-relaxed font-sans">{weak}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Interview Shortlisting Invitation Form */}
                <div className="border-t border-slate-200 pt-6 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Compose Shortlist Invitation Proposal</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 text-[10px] font-bold uppercase mb-1.5">Proposed Interview Details</label>
                      <input
                        type="text"
                        value={interviewDetails}
                        onChange={(e) => setInterviewDetails(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs transition-all"
                      />
                      <button
                        onClick={handleDraftEmail}
                        disabled={draftingEmail}
                        className="mt-3 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        {draftingEmail ? "Drafting with Gemini..." : "Draft Recruiter Email"}
                      </button>
                    </div>

                    {/* Email output */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-slate-500 text-[10px] font-bold uppercase">AI-Generated Email Outline</label>
                        {draftedEmail && (
                          <button
                            onClick={handleCopyEmail}
                            className="text-blue-600 hover:text-blue-700 text-[10px] font-bold flex items-center gap-1"
                          >
                            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            {copied ? "Copied" : "Copy text"}
                          </button>
                        )}
                      </div>
                      {draftedEmail ? (
                        <textarea
                          readOnly
                          value={draftedEmail}
                          rows={6}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-700 font-mono leading-relaxed resize-none focus:outline-none"
                        />
                      ) : (
                        <div className="h-32 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 text-xs text-center p-4">
                          Click "Draft Recruiter Email" to preview the email proposal.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal footer status outcomes */}
              <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                <span className="text-[10px] text-slate-500 font-mono">Current Status: <span className="uppercase text-slate-700 font-bold">{selectedReport.status}</span></span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedReport.id, "rejected")}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-semibold transition-all"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedReport.id, "shortlisted")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-md"
                  >
                    Shortlist Candidate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === "chatbot") {
    return (
      <div className="space-y-8" id="recruiter-chatbot-view">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            AI Recruiter Chatbot
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Query the parsed database context, summarize certifications, and cross-reference candidate history
          </p>
        </div>

        {/* Chat window interface */}
        <div className="bg-white border border-slate-200 rounded-2xl h-[550px] shadow-sm flex flex-col justify-between overflow-hidden" id="chatbot-window">
          {/* Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-800">Gemini Screener Assistant</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">Context: {jobs.length} Jobs • {candidatesList.length} Ranked Candidates</span>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4" id="chat-messages-container">
            {chatHistory.length === 0 && (
              <div className="text-center py-16 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">Start Screening Conversation</h4>
                <p className="text-slate-500 text-[11px] max-w-sm mx-auto">
                  Ask me questions like "Which candidates have React experience?", "Summarize Alex Rivera's strengths," or "Who is the strongest candidate for the Senior Analyst role?"
                </p>
              </div>
            )}

            {chatHistory.map((h, idx) => (
              <div
                key={idx}
                className={`flex ${h.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`p-3 rounded-xl max-w-lg text-xs leading-relaxed ${
                  h.role === "user"
                    ? "bg-blue-600 text-white font-semibold rounded-tr-none"
                    : "bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none font-sans"
                }`}>
                  {h.text}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-50 p-3 border border-slate-200 rounded-xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  Gemini is thinking...
                </div>
              </div>
            )}
          </div>

          {/* Send Input */}
          <form onSubmit={handleSendChat} className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask a question about candidates or jobs..."
              className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              id="chatbot-msg-input"
            />
            <button
              type="submit"
              disabled={!chatMessage.trim() || chatLoading}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl transition-all"
              id="chatbot-send-btn"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
}
