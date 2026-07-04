import React, { useState, useEffect } from "react";
import { ResumeData, JobDescription, JobMatchReport, InterviewQuestions, LearningRecommendation } from "../types";
import { api } from "../services/api";

import DashboardView from "./candidate/DashboardView";
import UploadView from "./candidate/UploadView";
import AnalysisView from "./candidate/AnalysisView";
import InterviewView from "./candidate/InterviewView";
import CareerView from "./candidate/CareerView";

interface CandidateDashboardProps {
  activeTab: string;
  apiClient: typeof api;
  resume: ResumeData | null;
  setResume: (res: ResumeData | null) => void;
  jobs: JobDescription[];
}

export default function CandidateDashboard({
  activeTab,
  apiClient,
  resume,
  setResume,
  jobs
}: CandidateDashboardProps) {
  const [matchedReports, setMatchedReports] = useState<JobMatchReport[]>([]);
  const [interviewData, setInterviewData] = useState<InterviewQuestions | null>(null);
  const [learningData, setLearningData] = useState<LearningRecommendation | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  useEffect(() => {
    // We shouldn't depend directly on resume.id in a way that creates an infinite loop if setResume is called.
    // However, if the resume is available on mount, we can fetch the reports.
    // A better approach is to rely on user interactions (upload, delete) to drive this, but for now we fetch once.
    if (resume?.id) {
      fetchResumeAndReports();
    }
  }, []); // Changed dependency array to prevent infinite loops

  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs]);

  useEffect(() => {
    if (resume && selectedJobId && (activeTab === "interview" || activeTab === "career")) {
      fetchAIRecommendations();
    }
  }, [resume?.id, selectedJobId, activeTab]);

  const fetchResumeAndReports = async () => {
    try {
      // It's safe to use Promise.allSettled for multiple independent calls
      const rpts = await apiClient.fetchRanking();
      if (resume) {
        const matchingJobPromises = jobs.map(job => apiClient.triggerMatch(resume.id, job.id));
        const results = await Promise.allSettled(matchingJobPromises);
        
        const validReports: JobMatchReport[] = [];
        results.forEach(res => {
          if (res.status === "fulfilled" && res.value) {
            validReports.push(res.value);
          }
        });
        setMatchedReports(validReports);
      }
    } catch (e) {
      console.error("Error fetching reports", e);
    }
  };

  const fetchAIRecommendations = async () => {
    if (!resume || !selectedJobId) return;
    setLoadingAI(true);
    try {
      const [interview, career] = await Promise.allSettled([
        apiClient.generateInterview(resume.id, selectedJobId),
        apiClient.careerAdvice(resume.id, selectedJobId)
      ]);
      
      if (interview.status === "fulfilled") {
        setInterviewData(interview.value);
      }
      if (career.status === "fulfilled") {
        setLearningData(career.value);
      }
    } catch (err) {
      console.error("Error loading AI elements:", err);
    } finally {
      setLoadingAI(false);
    }
  };

  const downloadTextReport = () => {
    if (!resume || !resume.fullName) return;
    const content = `
AI RESUME SCREEN REPORT: ${resume.fullName.toUpperCase()}
ATS Score: ${resume.atsScore}%
Email: ${resume.email}
Phone: ${resume.phone}

PROFESSIONAL SUMMARY:
${resume.professionalSummary || ""}

CORE SKILLS:
${(resume.skills || []).join(", ")}

STRENGTHS:
${(resume.strengths || []).map(s => `- ${s}`).join("\n")}

WEAKNESSES:
${(resume.weaknesses || []).map(w => `- ${w}`).join("\n")}

IMPROVEMENT SUGGESTIONS:
${(resume.improvementSuggestions || []).map(i => `- ${i}`).join("\n")}
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${resume.fullName.replace(/\s+/g, "_")}_AI_Report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  switch (activeTab) {
    case "dashboard":
      return (
        <DashboardView 
          resume={resume} 
          matchedReports={matchedReports} 
          jobs={jobs} 
          downloadTextReport={downloadTextReport} 
        />
      );
    case "upload":
      return (
        <UploadView 
          apiClient={apiClient} 
          resume={resume} 
          setResume={setResume} 
          fetchResumeAndReports={fetchResumeAndReports} 
        />
      );
    case "analysis":
      return <AnalysisView resume={resume} />;
    case "interview":
      return (
        <InterviewView 
          apiClient={apiClient} 
          resume={resume} 
          jobs={jobs} 
          selectedJobId={selectedJobId} 
          setSelectedJobId={setSelectedJobId} 
          interviewData={interviewData} 
          loadingAI={loadingAI} 
        />
      );
    case "career":
      return (
        <CareerView 
          resume={resume} 
          jobs={jobs} 
          selectedJobId={selectedJobId} 
          setSelectedJobId={setSelectedJobId} 
          learningData={learningData} 
          loadingAI={loadingAI} 
        />
      );
    default:
      return null;
  }
}
