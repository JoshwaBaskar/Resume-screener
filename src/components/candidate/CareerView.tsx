import React from "react";
import { BookOpen, Award, ArrowRight } from "lucide-react";
import { ResumeData, JobDescription, LearningRecommendation } from "../../types";

interface CareerViewProps {
  resume: ResumeData | null;
  jobs: JobDescription[];
  selectedJobId: string;
  setSelectedJobId: (id: string) => void;
  learningData: LearningRecommendation | null;
  loadingAI: boolean;
}

export default function CareerView({
  resume,
  jobs,
  selectedJobId,
  setSelectedJobId,
  learningData,
  loadingAI,
}: CareerViewProps) {
  if (!resume) {
    return (
      <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-slate-800">No Active Resume Found</h2>
        <p className="text-slate-500 text-xs mt-2 max-w-sm mx-auto">
          Please upload your resume to discover specialized study roadmaps and upskilling advice.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="candidate-career-view">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight">
            Tailored Study & Career Plan
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Curated roadmap courses, books, and credentials to bridge your alignment gaps
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">Select Target Job:</span>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            id="career-job-select"
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
        <div className="text-center py-20" id="career-loader">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-xs">Curating target learning path with Gemini...</p>
        </div>
      ) : !learningData ? (
        <p className="text-slate-500 text-xs py-8 text-center">No career path generated.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                Recommended Upskilling Courses
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="curated-courses-grid">
                {(learningData.courses || []).map((course, idx) => (
                  <div key={idx} className="bg-slate-50 p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-blue-600 uppercase font-mono bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                        {course.platform}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 mt-2 font-sans line-clamp-2 leading-relaxed">
                        {course.title}
                      </h4>
                    </div>
                    <a
                      href={course.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mt-4 transition-all"
                    >
                      Explore Course
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                  Curated Certifications
                </h3>
                <ul className="space-y-3" id="curated-certs-list">
                  {(learningData.certifications || []).map((cert, idx) => (
                    <li key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed font-semibold">
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                  Industry Standard Books
                </h3>
                <ul className="space-y-3" id="curated-books-list">
                  {(learningData.books || []).map((book, idx) => (
                    <li key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                      <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{book.title}</h4>
                        <span className="text-[10px] text-slate-500">By {book.author}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-6">
              Upskilling Progression Roadmap
            </h3>
            <div className="relative pl-6 border-l border-slate-200 space-y-6" id="career-roadmap-list">
              {(learningData.roadmap || []).map((step, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center text-[9px] font-bold text-blue-600 font-mono">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-bold font-sans">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
