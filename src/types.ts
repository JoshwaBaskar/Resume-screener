export enum UserRole {
  RECRUITER = "recruiter",
  CANDIDATE = "candidate",
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export interface ResumeData {
  id: string;
  candidateId: string;
  fullName: string;
  email: string;
  phone: string;
  skills: string[];
  projects: { title: string; description: string; tech: string[] }[];
  experience: { role: string; company: string; duration: string; details: string[] }[];
  education: { degree: string; school: string; year: string }[];
  certifications: string[];
  technologies: string[];
  softSkills: string[];
  professionalSummary: string;
  strengths: string[];
  weaknesses: string[];
  careerSuggestions: string[];
  atsScore: number;
  improvementSuggestions: string[];
  fileName?: string;
  uploadedAt: string;
}

export interface JobDescription {
  id: string;
  title: string;
  company: string;
  location: string;
  department: string;
  description: string;
  requirements: string[];
  experienceLevel: string;
  skillsRequired: string[];
  createdAt: string;
}

export interface JobMatchReport {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  matchScore: number;
  requiredSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  hiringRecommendation: "Hire" | "Shortlist" | "Reject" | "Strong Hire";
  confidenceScore: number;
  status: "pending" | "shortlisted" | "rejected";
  matchedAt: string;
}

export interface InterviewQuestions {
  technical: { question: string; idealAnswer: string; difficulty: string }[];
  hr: { question: string; idealAnswer: string }[];
  scenario: { question: string; situation: string; challenge: string }[];
}

export interface LearningRecommendation {
  courses: { title: string; platform: string; url: string }[];
  certifications: string[];
  books: { title: string; author: string }[];
  youtubeChannels: string[];
  roadmap: string[];
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
