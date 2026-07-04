import express, { Request, Response, NextFunction } from "express";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import { db } from "./server/db";
import { UserRole } from "./src/types";
import {
  analyzeResume,
  matchResumeToJob,
  generateInterviewQuestions,
  generateLearningRecommendation,
  generateCoverLetter,
  generateRecruiterEmail,
  chatWithRecruiter,
} from "./server/ai";

const JWT_SECRET = process.env.JWT_SECRET || "ai-resume-screener-enterprise-secret-key-2026";
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Middleware to authenticate JWT tokens
  const authenticateToken = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }
      req.user = user;
      next();
    });
  };

  // Helper to emit notification
  const addNotification = (userId: string, title: string, message: string) => {
    const notif = {
      id: "not-" + Math.random().toString(36).substring(2, 9),
      userId,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    db.getNotifications().unshift(notif);
    db.save();
  };

  // --- REST APIs ---

  // Auth APIs
  app.post("/api/register", (req: Request, res: Response) => {
    try {
      const { email, password, fullName, role } = req.body;
      if (!email || !password || !fullName || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const users = db.getUsers();
      if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(400).json({ error: "Email is already registered" });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const newUser = {
        id: "u-" + Math.random().toString(36).substring(2, 9),
        email: email.toLowerCase(),
        fullName,
        role: role as UserRole,
        passwordHash,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      db.save();

      const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.fullName }, JWT_SECRET, {
        expiresIn: "24h",
      });

      res.status(201).json({
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role,
        },
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/login", (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const users = db.getUsers();
      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role, fullName: user.fullName }, JWT_SECRET, {
        expiresIn: "24h",
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/me", authenticateToken, (req: any, res: Response) => {
    res.json({ user: req.user });
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    res.json({ success: true, message: "Logged out successfully" });
  });

  // Candidate Resume APIs
  app.post("/api/uploadResume", authenticateToken, async (req: any, res: Response) => {
    try {
      const { resumeText, fileName } = req.body;
      if (!resumeText) {
        return res.status(400).json({ error: "Resume text is empty or missing" });
      }

      const candidateId = req.user.id;
      const parsedResume = await analyzeResume(resumeText, fileName, candidateId);

      // Remove existing resume for this candidate if any
      const resumes = db.getResumes();
      const existingIdx = resumes.findIndex((r) => r.candidateId === candidateId);
      if (existingIdx !== -1) {
        resumes.splice(existingIdx, 1);
      }

      resumes.push(parsedResume);
      db.save();

      addNotification(candidateId, "Resume Screened Successfully", `Your resume '${fileName || "Pasted Text"}' has been parsed. ATS score: ${parsedResume.atsScore}%`);
      
      // Auto-match against existing jobs for candidate convenience
      const jobs = db.getJobs();
      const reports = db.getReports();
      for (const job of jobs) {
        // Clear old reports
        const oldIdx = reports.findIndex(rep => rep.candidateId === candidateId && rep.jobId === job.id);
        if (oldIdx !== -1) reports.splice(oldIdx, 1);
        
        // Match
        const matchRep = await matchResumeToJob(parsedResume, job);
        reports.push(matchRep);
      }
      db.save();

      res.status(201).json(parsedResume);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/resume", authenticateToken, (req: any, res: Response) => {
    try {
      const resumes = db.getResumes();
      const resume = resumes.find((r) => r.candidateId === req.user.id);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found for candidate. Please upload." });
      }
      res.json(resume);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/resume/:id", authenticateToken, (req: any, res: Response) => {
    try {
      const resumes = db.getResumes();
      const resume = resumes.find((r) => r.id === req.params.id);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found." });
      }
      res.json(resume);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/resume", authenticateToken, (req: any, res: Response) => {
    try {
      const resumes = db.getResumes();
      const index = resumes.findIndex((r) => r.candidateId === req.user.id);
      if (index === -1) {
        return res.status(404).json({ error: "No resume found to delete" });
      }

      resumes.splice(index, 1);
      
      // Also delete relevant reports
      const reports = db.getReports();
      db.save(); // Save after splice
      
      // Filter out deleted resumes from reports
      const updatedReports = reports.filter(rep => rep.candidateId !== req.user.id);
      db.getReports().length = 0;
      db.getReports().push(...updatedReports);
      db.save();

      res.json({ success: true, message: "Resume deleted successfully" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/resume", authenticateToken, (req: any, res: Response) => {
    try {
      const resumes = db.getResumes();
      const index = resumes.findIndex((r) => r.candidateId === req.user.id);
      if (index === -1) {
        return res.status(404).json({ error: "No resume found to update" });
      }

      resumes[index] = {
        ...resumes[index],
        ...req.body,
        uploadedAt: new Date().toISOString(),
      };
      db.save();

      res.json(resumes[index]);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Recruiter Job APIs
  app.post("/api/jobs", authenticateToken, (req: any, res: Response) => {
    try {
      if (req.user.role !== UserRole.RECRUITER) {
        return res.status(403).json({ error: "Only recruiters can create job listings" });
      }

      const { title, company, location, department, description, requirements, experienceLevel, skillsRequired } = req.body;
      if (!title || !company || !description) {
        return res.status(400).json({ error: "Missing required fields (title, company, description)" });
      }

      const newJob = {
        id: "job-" + Math.random().toString(36).substring(2, 9),
        title,
        company,
        location: location || "Remote",
        department: department || "Engineering",
        description,
        requirements: Array.isArray(requirements) ? requirements : [requirements],
        experienceLevel: experienceLevel || "Mid-level",
        skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : [],
        createdAt: new Date().toISOString(),
      };

      db.getJobs().push(newJob);
      db.save();

      // Trigger automatic matching for all existing resumes against this new job
      const resumes = db.getResumes();
      const reports = db.getReports();
      Promise.all(
        resumes.map(async (resume) => {
          try {
            const report = await matchResumeToJob(resume, newJob);
            reports.push(report);
            addNotification(resume.candidateId, "New Matched Job Opportunity!", `Your background was matched against our newly posted role '${title}' at '${company}'. Match score: ${report.matchScore}%`);
          } catch (me) {
            console.error("Auto match background error:", me);
          }
        })
      ).then(() => {
        db.save();
      });

      res.status(201).json(newJob);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/jobs", authenticateToken, (req: Request, res: Response) => {
    try {
      res.json(db.getJobs());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/job/:id", authenticateToken, (req: any, res: Response) => {
    try {
      if (req.user.role !== UserRole.RECRUITER) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const jobs = db.getJobs();
      const index = jobs.findIndex((j) => j.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: "Job description not found" });
      }

      jobs.splice(index, 1);
      
      // Remove match reports for this job
      const reports = db.getReports();
      const updatedReports = reports.filter(rep => rep.jobId !== req.params.id);
      db.getReports().length = 0;
      db.getReports().push(...updatedReports);
      
      db.save();

      res.json({ success: true, message: "Job deleted successfully" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/job/:id", authenticateToken, (req: any, res: Response) => {
    try {
      if (req.user.role !== UserRole.RECRUITER) {
        return res.status(403).json({ error: "Unauthorized access" });
      }

      const jobs = db.getJobs();
      const index = jobs.findIndex((j) => j.id === req.params.id);
      if (index === -1) {
        return res.status(404).json({ error: "Job description not found" });
      }

      jobs[index] = {
        ...jobs[index],
        ...req.body,
      };
      db.save();

      res.json(jobs[index]);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Matching & Ranking APIs
  app.post("/api/match", authenticateToken, async (req: any, res: Response) => {
    try {
      const { resumeId, jobId } = req.body;
      if (!resumeId || !jobId) {
        return res.status(400).json({ error: "resumeId and jobId are required" });
      }

      const resume = db.getResumes().find((r) => r.id === resumeId);
      const job = db.getJobs().find((j) => j.id === jobId);

      if (!resume || !job) {
        return res.status(404).json({ error: "Resume or Job Description not found" });
      }

      const report = await matchResumeToJob(resume, job);
      
      // Update or insert report
      const reports = db.getReports();
      const existingIdx = reports.findIndex((rep) => rep.candidateId === resume.candidateId && rep.jobId === job.id);
      if (existingIdx !== -1) {
        reports[existingIdx] = report;
      } else {
        reports.push(report);
      }
      db.save();

      res.json(report);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/topCandidates", authenticateToken, (req: any, res: Response) => {
    try {
      const { jobId } = req.query;
      if (!jobId) {
        return res.status(400).json({ error: "jobId query param is required" });
      }

      const reports = db.getReports().filter((rep) => rep.jobId === jobId);
      const sortedReports = reports.sort((a, b) => b.matchScore - a.matchScore);

      res.json(sortedReports);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/ranking", authenticateToken, (req: any, res: Response) => {
    try {
      const reports = db.getReports();
      const jobs = db.getJobs();
      const resumes = db.getResumes();

      const totalCandidates = resumes.length;
      const totalJobs = jobs.length;

      const matchedReports = reports.filter((rep) => rep.status !== "rejected");
      const avgMatchScore = matchedReports.length > 0
        ? Math.round(matchedReports.reduce((sum, r) => sum + r.matchScore, 0) / matchedReports.length)
        : 0;

      // Extract skills frequencies
      const skillCounts: Record<string, number> = {};
      resumes.forEach((r) => {
        r.skills.forEach((s) => {
          skillCounts[s] = (skillCounts[s] || 0) + 1;
        });
      });
      const topSkills = Object.entries(skillCounts)
        .map(([skill, count]) => ({ skill, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Recommendations distribution
      const recCounts: Record<string, number> = { "Strong Hire": 0, "Hire": 0, "Shortlist": 0, "Reject": 0 };
      reports.forEach((rep) => {
        recCounts[rep.hiringRecommendation] = (recCounts[rep.hiringRecommendation] || 0) + 1;
      });

      res.json({
        totalCandidates,
        totalJobs,
        avgMatchScore,
        topSkills,
        recommendationDistribution: Object.entries(recCounts).map(([name, value]) => ({ name, value })),
        totalReports: reports.length,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Shortlist or Reject Candidate status update
  app.post("/api/match/status", authenticateToken, (req: any, res: Response) => {
    try {
      if (req.user.role !== UserRole.RECRUITER) {
        return res.status(403).json({ error: "Only recruiters can change shortlist statuses" });
      }

      const { reportId, status } = req.body;
      if (!reportId || !status) {
        return res.status(400).json({ error: "Missing required params (reportId, status)" });
      }

      const reports = db.getReports();
      const rep = reports.find(r => r.id === reportId);
      if (!rep) {
        return res.status(404).json({ error: "Match report not found" });
      }

      rep.status = status;
      db.save();

      // Notify candidate
      const job = db.getJobs().find(j => j.id === rep.jobId);
      addNotification(
        rep.candidateId, 
        `Application Status Updated: ${status.toUpperCase()}`, 
        `Your application for '${job?.title || "Role"}' has been marked as ${status.toUpperCase()} by the recruiting team.`
      );

      res.json(rep);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // AI Features APIs
  app.post("/api/generate-interview", authenticateToken, async (req: any, res: Response) => {
    try {
      const { resumeId, jobId } = req.body;
      if (!resumeId || !jobId) {
        return res.status(400).json({ error: "resumeId and jobId are required" });
      }

      const resume = db.getResumes().find((r) => r.id === resumeId);
      const job = db.getJobs().find((j) => j.id === jobId);

      if (!resume || !job) {
        return res.status(404).json({ error: "Resume or Job Description not found" });
      }

      const interviewData = await generateInterviewQuestions(resume, job);
      res.json(interviewData);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/career-advice", authenticateToken, async (req: any, res: Response) => {
    try {
      const { resumeId, jobId } = req.body;
      if (!resumeId || !jobId) {
        return res.status(400).json({ error: "resumeId and jobId are required" });
      }

      const resume = db.getResumes().find((r) => r.id === resumeId);
      const job = db.getJobs().find((j) => j.id === jobId);

      if (!resume || !job) {
        return res.status(404).json({ error: "Resume or Job Description not found" });
      }

      const learningData = await generateLearningRecommendation(resume, job);
      res.json(learningData);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/cover-letter", authenticateToken, async (req: any, res: Response) => {
    try {
      const { resumeId, jobId } = req.body;
      if (!resumeId || !jobId) {
        return res.status(400).json({ error: "resumeId and jobId are required" });
      }

      const resume = db.getResumes().find((r) => r.id === resumeId);
      const job = db.getJobs().find((j) => j.id === jobId);

      if (!resume || !job) {
        return res.status(404).json({ error: "Resume or Job Description not found" });
      }

      const coverLetter = await generateCoverLetter(resume, job);
      
      // Save cover letter to db
      const entry = {
        id: "cl-" + Math.random().toString(36).substring(2, 9),
        candidateId: resume.candidateId,
        jobId: job.id,
        letter: coverLetter,
        createdAt: new Date().toISOString()
      };
      db.getCoverLetters().unshift(entry);
      db.save();

      res.json(entry);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/email-generator", authenticateToken, async (req: any, res: Response) => {
    try {
      if (req.user.role !== UserRole.RECRUITER) {
        return res.status(403).json({ error: "Only recruiters can compose shortlist invitation emails" });
      }

      const { reportId, interviewDetails } = req.body;
      if (!reportId || !interviewDetails) {
        return res.status(400).json({ error: "reportId and interviewDetails are required" });
      }

      const report = db.getReports().find((rep) => rep.id === reportId);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }

      const job = db.getJobs().find((j) => j.id === report.jobId);
      if (!job) {
        return res.status(404).json({ error: "Job Description not found" });
      }

      const emailBody = await generateRecruiterEmail(report, job, interviewDetails);
      res.json({ email: emailBody });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/recruiter-chatbot", authenticateToken, async (req: any, res: Response) => {
    try {
      const { query, history } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const resumes = db.getResumes();
      const jobs = db.getJobs();
      
      const responseText = await chatWithRecruiter(query, resumes, jobs, history || []);
      res.json({ response: responseText });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Notifications API
  app.get("/api/notifications", authenticateToken, (req: any, res: Response) => {
    try {
      const list = db.getNotifications().filter(n => n.userId === req.user.id);
      res.json(list);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/notifications/read", authenticateToken, (req: any, res: Response) => {
    try {
      const list = db.getNotifications().filter(n => n.userId === req.user.id);
      list.forEach(n => { n.read = true; });
      db.save();
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Bulk Upload endpoint
  app.post("/api/bulk-upload", authenticateToken, async (req: any, res: Response) => {
    try {
      const { resumesList } = req.body; // Array of { name, text, fileName }
      if (!Array.isArray(resumesList) || resumesList.length === 0) {
        return res.status(400).json({ error: "resumesList is empty or invalid" });
      }

      const jobs = db.getJobs();
      const dbResumes = db.getResumes();
      const dbReports = db.getReports();

      const parsedResults = [];

      for (const resItem of resumesList) {
        // Mock a unique user id for bulk entry
        const bulkCandidateId = "u-bulk-" + Math.random().toString(36).substring(2, 6);
        const parsed = await analyzeResume(resItem.text, resItem.fileName, bulkCandidateId);
        parsed.fullName = resItem.name || parsed.fullName;
        
        dbResumes.push(parsed);

        // Auto-match against active jobs
        for (const job of jobs) {
          const rep = await matchResumeToJob(parsed, job);
          dbReports.push(rep);
        }

        parsedResults.push(parsed);
      }

      db.save();
      res.status(201).json({ success: true, count: parsedResults.length, results: parsedResults });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // --- End of REST APIs ---

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("Failed to start server on port 3000:", e);
});
