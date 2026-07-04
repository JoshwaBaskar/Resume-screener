import React, { useState } from "react";
import { HelpCircle, ChevronDown, Mail, Plus } from "lucide-react";
import { ResumeData, JobDescription, InterviewQuestions } from "../../types";
import { api } from "../../services/api";

interface InterviewViewProps {
  apiClient: typeof api;
  resume: ResumeData | null;
  jobs: JobDescription[];
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
  interviewData: InterviewQuestions | null;
  loadingAI: boolean;
}

export default function InterviewView({
  apiClient,
  resume,
  jobs,
  selectedJobId,
  setSelectedJobId,
  interviewData,
  loadingAI,
}: InterviewViewProps) {
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [generatingCL, setGeneratingCL] = useState(false);
  const [generatedCL, setGeneratedCL] = useState<string | null>(null);

  if (!resume) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <HelpCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-800">No Active Resume Found</h2>
        <p className="text-slate-500 text-xs mt-2 max-w-sm mx-auto">
          Please upload your resume first to let the AI tailor specific questions to your background.
        </p>
      </div>
    );
  }

  const handleGenerateCoverLetter = async () => {
    if (!resume || !selectedJobId) return;
    setGeneratingCL(true);
    try {
      const data = await apiClient.generateCoverLetter(resume.id, selectedJobId);
      setGeneratedCL(data.letter);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingCL(false);
    }
  };

  return (
    <div className="space-y-8" id="candidate-interview-view">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
            AI Interview Assistant
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Custom-tailored Technical, HR, and Scenario questions based on your CV profile mapping
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">Select Target Job:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="interview-job-select"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.company})
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingAI ? (
        <div className="text-center py-20" id="interview-loader">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-xs">Tailoring custom interview questions with Gemini API...</p>
        </div>
      ) : !interviewData ? (
        <p className="text-slate-500 text-xs py-8 text-center">No interview questions generated. Check network connection.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6" id="interview-accordion-container">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                Technical Tailored QA ({interviewData.technical?.length || 0} Questions)
              </h3>
              {(interviewData.technical || []).map((q, idx) => (
                <div key={`tech-${idx}`} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setActiveQuestionIdx(activeQuestionIdx === `tech-${idx}` ? null : `tech-${idx}`)}
                    className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono font-bold text-blue-600 mt-0.5">T{idx + 1}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed font-sans">{q.question}</p>
                        <span className="inline-block mt-1.5 bg-slate-100 text-slate-600 text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded">
                          Difficulty: {q.difficulty || "Medium"}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-all ${activeQuestionIdx === `tech-${idx}` ? "transform rotate-180" : ""}`} />
                  </button>

                  {activeQuestionIdx === `tech-${idx}` && (
                    <div className="p-4 bg-slate-50/50 border-t border-slate-200 space-y-3">
                      <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Practice Your Response</label>
                        <textarea
                          value={userAnswers[`tech-${idx}`] || ""}
                          onChange={(e) => setUserAnswers({ ...userAnswers, [`tech-${idx}`]: e.target.value })}
                          placeholder="Type your practice response here..."
                          rows={3}
                          className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                        />
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                        <span className="text-emerald-600 text-[9px] font-bold uppercase block">AI Recommended Answer Outline</span>
                        <p className="text-slate-700 text-[11px] mt-1.5 leading-relaxed font-sans font-medium">{q.idealAnswer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                HR Tailored Alignment ({interviewData.hr?.length || 0} Questions)
              </h3>
              {(interviewData.hr || []).map((q, idx) => (
                <div key={`hr-${idx}`} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setActiveQuestionIdx(activeQuestionIdx === `hr-${idx}` ? null : `hr-${idx}`)}
                    className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono font-bold text-indigo-600 mt-0.5">H{idx + 1}</span>
                      <p className="text-xs font-bold text-slate-800 leading-relaxed font-sans">{q.question}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-all ${activeQuestionIdx === `hr-${idx}` ? "transform rotate-180" : ""}`} />
                  </button>

                  {activeQuestionIdx === `hr-${idx}` && (
                    <div className="p-4 bg-slate-50/50 border-t border-slate-200 space-y-3">
                      <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Practice Your Response</label>
                        <textarea
                          value={userAnswers[`hr-${idx}`] || ""}
                          onChange={(e) => setUserAnswers({ ...userAnswers, [`hr-${idx}`]: e.target.value })}
                          placeholder="Type your practice response here..."
                          rows={3}
                          className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                        />
                      </div>
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                        <span className="text-emerald-600 text-[9px] font-bold uppercase block">AI Recommended Answer Outline</span>
                        <p className="text-slate-700 text-[11px] mt-1.5 leading-relaxed font-sans font-medium">{q.idealAnswer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                Situational & Scenario Prompts ({interviewData.scenario?.length || 0} Questions)
              </h3>
              {(interviewData.scenario || []).map((q, idx) => (
                <div key={`scen-${idx}`} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setActiveQuestionIdx(activeQuestionIdx === `scen-${idx}` ? null : `scen-${idx}`)}
                    className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono font-bold text-emerald-600 mt-0.5">S{idx + 1}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-relaxed font-sans">{q.question}</p>
                        <span className="inline-block mt-1.5 bg-slate-100 text-slate-600 text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded">
                          Challenge: {q.challenge}
                        </span>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-all ${activeQuestionIdx === `scen-${idx}` ? "transform rotate-180" : ""}`} />
                  </button>

                  {activeQuestionIdx === `scen-${idx}` && (
                    <div className="p-4 bg-slate-50/50 border-t border-slate-200 space-y-3">
                      <div className="bg-white border border-slate-200 p-3 rounded-lg">
                        <span className="text-slate-500 text-[9px] font-bold uppercase block">Core Situation Context</span>
                        <p className="text-slate-700 text-[11px] mt-1 font-medium">{q.situation}</p>
                      </div>
                      <div>
                        <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Practice Your Response</label>
                        <textarea
                          value={userAnswers[`scen-${idx}`] || ""}
                          onChange={(e) => setUserAnswers({ ...userAnswers, [`scen-${idx}`]: e.target.value })}
                          placeholder="Type your practice response here..."
                          rows={3}
                          className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                  AI Cover Letter Generator
                </h3>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  Instantly compose a tailored cover letter from your parsed achievements specifically addressed to this job posting.
                </p>
                
                {generatedCL && (
                  <textarea
                    readOnly
                    value={generatedCL}
                    rows={12}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-700 font-mono leading-relaxed resize-none focus:outline-none"
                    id="cover-letter-output"
                  />
                )}
              </div>

              <div className="mt-4">
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={generatingCL}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5"
                  id="generate-cover-letter-btn"
                >
                  {generatingCL ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating letter...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Generate Cover Letter
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
