import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { User, UserRole, ResumeData, JobDescription, JobMatchReport, AppNotification } from "../src/types";

const DB_FILE = path.join(process.cwd(), "data_db.json");

interface DatabaseSchema {
  users: any[];
  resumes: ResumeData[];
  jobs: JobDescription[];
  reports: JobMatchReport[];
  notifications: AppNotification[];
  coverLetters: { id: string; candidateId: string; jobId: string; letter: string; createdAt: string }[];
}

const initialDb: DatabaseSchema = {
  users: [],
  resumes: [],
  jobs: [],
  reports: [],
  notifications: [],
  coverLetters: [],
};

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = { ...initialDb };
    this.load();
    if (this.data.users.length === 0) {
      this.seed();
    }
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        this.data = JSON.parse(fileContent);
      } else {
        this.data = { ...initialDb };
        this.save();
      }
    } catch (e) {
      console.error("Error loading local database:", e);
      this.data = { ...initialDb };
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error saving local database:", e);
    }
  }

  public getUsers() { return this.data.users; }
  public getResumes() { return this.data.resumes; }
  public getJobs() { return this.data.jobs; }
  public getReports() { return this.data.reports; }
  public getNotifications() { return this.data.notifications; }
  public getCoverLetters() { return this.data.coverLetters; }

  private seed() {
    console.log("Seeding initial mock data into database...");
    
    // Seed Recruiter
    const recruiterPasswordHash = bcrypt.hashSync("password123", 10);
    const recruiterUser = {
      id: "u-recruiter-1",
      email: "recruiter@enterprise.com",
      fullName: "Sarah Jenkins",
      role: UserRole.RECRUITER,
      passwordHash: recruiterPasswordHash,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(recruiterUser);

    // Seed Candidate 1
    const candidatePasswordHash = bcrypt.hashSync("password123", 10);
    const candidateUser1 = {
      id: "u-candidate-1",
      email: "alex.coder@gmail.com",
      fullName: "Alex Rivera",
      role: UserRole.CANDIDATE,
      passwordHash: candidatePasswordHash,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(candidateUser1);

    // Seed Candidate 2
    const candidateUser2 = {
      id: "u-candidate-2",
      email: "emily.data@gmail.com",
      fullName: "Emily Chen",
      role: UserRole.CANDIDATE,
      passwordHash: candidatePasswordHash,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(candidateUser2);

    // Seed Jobs
    const job1: JobDescription = {
      id: "job-1",
      title: "Senior Full Stack Engineer",
      company: "Google Cloud",
      location: "Sunnyvale, CA (Hybrid)",
      department: "Cloud AI Services",
      description: "We are seeking a Senior Full Stack Engineer to lead the design and development of our next-generation AI-powered cloud applications. You will collaborate with product managers, AI researchers, and DevOps engineers to deliver secure, responsive, and robust user experiences. Key activities include building REST and GraphQL APIs, managing scalable frontends in React, and integrating Gemini API workflows.",
      requirements: [
        "8+ years of experience with React, Node.js, and TypeScript.",
        "Proven experience integrating GenAI APIs (such as Gemini, OpenAI).",
        "Strong experience with state management, layout transitions, and micro-frontend design.",
        "Familiarity with cloud platforms (GCP preferred) and container orchestration."
      ],
      experienceLevel: "Senior (8+ years)",
      skillsRequired: ["React", "TypeScript", "Node.js", "Express", "Gemini API", "GCP", "Docker", "Tailwind CSS"],
      createdAt: new Date().toISOString(),
    };

    const job2: JobDescription = {
      id: "job-2",
      title: "AI Product Analyst",
      company: "DeepMind Ventures",
      location: "London, UK (Remote)",
      department: "AI Innovation Lab",
      description: "Join us as an AI Product Analyst to help refine product requirements and run semantic assessments for our intelligent portfolio products. You will analyze system behaviors, craft robust testing scenarios, model analytical workflows, and generate candidate summaries to direct technical strategy.",
      requirements: [
        "3+ years of experience in AI product analysis or systems engineering.",
        "Strong understanding of vector indices, text embeddings, and model response validation.",
        "Excellent reporting, communication, and cross-functional coordination skills."
      ],
      experienceLevel: "Mid-level (3+ years)",
      skillsRequired: ["AI Product Strategy", "Vector Embeddings", "Data Analysis", "Prompt Engineering", "Python", "SQL"],
      createdAt: new Date().toISOString(),
    };

    this.data.jobs.push(job1, job2);

    // Seed Resumes
    const resume1: ResumeData = {
      id: "res-1",
      candidateId: "u-candidate-1",
      fullName: "Alex Rivera",
      email: "alex.coder@gmail.com",
      phone: "+1 (555) 342-9988",
      skills: ["React", "TypeScript", "Node.js", "Express", "Docker", "Tailwind CSS", "MongoDB", "Python", "Next.js"],
      projects: [
        {
          title: "Enterprise AI Chat Assistant",
          description: "Developed a secure full-stack customer support platform that leverages LLM models to provide dynamic search grounding. Orchestrated on AWS with Docker.",
          tech: ["React", "Node.js", "LLM APIs", "Docker", "AWS"]
        },
        {
          title: "Bento Portfolio Generator",
          description: "Created an interactive grid-based portfolio editor for developers using Vite, tailwind, and motion libraries.",
          tech: ["TypeScript", "React", "Tailwind CSS", "Vite"]
        }
      ],
      experience: [
        {
          role: "Senior Frontend Developer",
          company: "SaaS Tech Solutions",
          duration: "2021 - Present",
          details: [
            "Led a team of 4 front-end engineers to rebuild the enterprise dashboard in React and Tailwind CSS, increasing performance by 40%.",
            "Designed reusable visual components, integrated custom search indexes, and maintained security headers on all incoming requests."
          ]
        },
        {
          role: "Software Engineer",
          company: "Alpha Byte Corp",
          duration: "2018 - 2021",
          details: [
            "Engineered production REST APIs in Express/Node.js, servicing over 50,000 daily active users.",
            "Wrote comprehensive unit tests and automated workflows to reduce deployment cycles."
          ]
        }
      ],
      education: [
        {
          degree: "Bachelor of Science in Computer Science",
          school: "University of California, Berkeley",
          year: "2018"
        }
      ],
      certifications: ["AWS Certified Solutions Architect", "Google Cloud Professional Developer"],
      technologies: ["Git", "PostgreSQL", "Redis", "Vercel", "Kubernetes"],
      softSkills: ["Leadership", "Agile Methodologies", "Clear Technical Communication", "Self-Driven"],
      professionalSummary: "A passionate, detail-oriented Full Stack Developer with 8+ years of expertise in crafting responsive, performant React web applications and highly optimized Node.js microservices. Deeply familiar with GenAI integrations and cloud deployment practices.",
      strengths: [
        "Highly experienced in React and robust TypeScript architectures.",
        "Proven record of rebuilding dashboards with massive performance gains.",
        "Familiarity with production-ready Docker containerization and AWS."
      ],
      weaknesses: [
        "Limited deep operational experience in Python AI modeling (prefer Node.js full-stack framework).",
        "Less involvement with direct DevOps infrastructure provisioning, focusing more on app code."
      ],
      careerSuggestions: [
        "Pivot into Lead Full Stack AI Engineer roles specializing in prompt pipeline designs.",
        "Consider learning advanced Rust-based compilation tools for high-performance frontend tooling."
      ],
      atsScore: 88,
      improvementSuggestions: [
        "Quantify the results in 'Software Engineer' role (e.g. 'reduced latency by 25%').",
        "Mention specific databases used in your projects section to align with SQL / NoSQL requirements."
      ],
      fileName: "alex_rivera_resume.pdf",
      uploadedAt: new Date().toISOString(),
    };

    const resume2: ResumeData = {
      id: "res-2",
      candidateId: "u-candidate-2",
      fullName: "Emily Chen",
      email: "emily.data@gmail.com",
      phone: "+1 (555) 781-2244",
      skills: ["Data Analysis", "Prompt Engineering", "Python", "SQL", "Tableau", "Machine Learning", "Pytorch", "PowerBI"],
      projects: [
        {
          title: "Semantic Patent Search Engine",
          description: "Engineered a semantic retrieval pipeline utilizing sentence transformers and a vector index to screen and index millions of entries.",
          tech: ["Python", "PyTorch", "Pinecone", "Transformers"]
        }
      ],
      experience: [
        {
          role: "AI Product Analyst",
          company: "Nexus Analytics",
          duration: "2022 - Present",
          details: [
            "Analyzed prompt performance across several model providers, fine-tuning outputs to reduce prompt drift by 18%.",
            "Designed and delivered detailed business intelligence dashboards using Python and PowerBI."
          ]
        }
      ],
      education: [
        {
          degree: "Master of Science in Business Analytics",
          school: "Columbia University",
          year: "2022"
        }
      ],
      certifications: ["Professional Machine Learning Engineer (GCP)", "Data Analyst Specialization (Coursera)"],
      technologies: ["Pandas", "NumPy", "Jupyter Notebook", "PostgreSQL", "Git"],
      softSkills: ["Analytical Thinking", "Cross-functional Collaboration", "Business Acumen"],
      professionalSummary: "Meticulous AI Product Analyst with robust experience in validating language model outputs, performing semantic analyses, and creating highly structured analytical models in Python and SQL.",
      strengths: [
        "Deep understanding of vector embeddings, neural retrievals, and prompt tuning.",
        "Excellent background in analytics tools and dashboard designs."
      ],
      weaknesses: [
        "Lacks full-stack web development experience (minimal React/TypeScript knowledge).",
        "No previous exposure to managing Kubernetes deployments."
      ],
      careerSuggestions: [
        "Target Machine Learning Product Management or Senior AI Consultant positions.",
        "Pick up JavaScript basics to design interactive web mockups for faster model prototyping."
      ],
      atsScore: 75,
      improvementSuggestions: [
        "Add a visual timeline of projects or separate personal projects from business activities.",
        "Include references to standard CI/CD tooling or version control systems used."
      ],
      fileName: "emily_chen_resume_v2.docx",
      uploadedAt: new Date().toISOString(),
    };

    this.data.resumes.push(resume1, resume2);

    // Seed Matches/Reports
    const report1: JobMatchReport = {
      id: "rep-1",
      jobId: "job-1",
      candidateId: "u-candidate-1",
      candidateName: "Alex Rivera",
      matchScore: 92,
      requiredSkills: ["React", "TypeScript", "Node.js", "Express", "Docker", "Tailwind CSS"],
      missingSkills: ["Gemini API", "GCP"],
      strengths: [
        "Has 8+ years of frontend and full-stack experience matching the 'Senior' qualification.",
        "Excellent practical experience with Docker and React, matching the core engineering stack."
      ],
      weaknesses: [
        "No direct Google Cloud (GCP) production exposure listed in his professional experience details.",
        "Lacks formal Gemini API projects, though highly familiar with standard LLM APIs."
      ],
      hiringRecommendation: "Strong Hire",
      confidenceScore: 95,
      status: "shortlisted",
      matchedAt: new Date().toISOString(),
    };

    const report2: JobMatchReport = {
      id: "rep-2",
      jobId: "job-2",
      candidateId: "u-candidate-2",
      candidateName: "Emily Chen",
      matchScore: 89,
      requiredSkills: ["AI Product Strategy", "Vector Embeddings", "Data Analysis", "Prompt Engineering", "Python", "SQL"],
      missingSkills: [],
      strengths: [
        "Perfect mapping of skillsets (Python, SQL, Prompt Engineering) to the requested stack.",
        "Professional experience as an AI Analyst matching the exact title and expectations."
      ],
      weaknesses: [
        "Slightly fewer years of experience than candidates with extensive legacy engineering histories.",
        "Has not engineered container configurations (Docker/K8s)."
      ],
      hiringRecommendation: "Hire",
      confidenceScore: 90,
      status: "pending",
      matchedAt: new Date().toISOString(),
    };

    const report3: JobMatchReport = {
      id: "rep-3",
      jobId: "job-1",
      candidateId: "u-candidate-2",
      candidateName: "Emily Chen",
      matchScore: 35,
      requiredSkills: ["React", "TypeScript", "Node.js"],
      missingSkills: ["React", "TypeScript", "Node.js", "Express", "Docker", "Tailwind CSS", "GCP", "Gemini API"],
      strengths: ["Strong background in data modeling and general scripting in Python."],
      weaknesses: ["No core front-end experience in React or TypeScript.", "Missing almost all required tools in the description."],
      hiringRecommendation: "Reject",
      confidenceScore: 98,
      status: "rejected",
      matchedAt: new Date().toISOString(),
    };

    this.data.reports.push(report1, report2, report3);

    // Seed notifications
    this.data.notifications.push({
      id: "not-1",
      userId: "u-candidate-1",
      title: "Resume Screened Successfully",
      message: "Your resume 'alex_rivera_resume.pdf' has been parsed by our AI Screen agent. Overall ATS Score: 88%. Check improvement suggestions!",
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.data.notifications.push({
      id: "not-2",
      userId: "u-recruiter-1",
      title: "New Top Candidate Match",
      message: "Alex Rivera matches your 'Senior Full Stack Engineer' posting with a match score of 92%!",
      read: false,
      createdAt: new Date().toISOString(),
    });

    this.save();
    console.log("Mock data seeded successfully.");
  }
}

export const db = new Database();
