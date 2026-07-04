import React, { useState } from "react";
import { motion } from "motion/react";
import { Briefcase, User as UserIcon, Lock, Mail, Users, CheckCircle } from "lucide-react";
import { UserRole } from "../types";

interface AuthPageProps {
  onAuthSuccess: (token: string, user: any) => void;
  apiClient: any;
}

export default function AuthPage({ onAuthSuccess, apiClient }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.CANDIDATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const response = await apiClient.login({ email, password });
        onAuthSuccess(response.token, response.user);
      } else {
        const response = await apiClient.register({ email, password, fullName, role });
        onAuthSuccess(response.token, response.user);
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCreds = (demoRole: UserRole) => {
    setError(null);
    if (demoRole === UserRole.RECRUITER) {
      setEmail("recruiter@enterprise.com");
      setPassword("password123");
      setRole(UserRole.RECRUITER);
      setIsLogin(true);
    } else {
      setEmail("alex.coder@gmail.com");
      setPassword("password123");
      setRole(UserRole.CANDIDATE);
      setIsLogin(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-50 via-white to-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden" id="auth-page-container">
      {/* Decorative ambient background lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-slate-200 p-8 rounded-2xl shadow-xl z-10"
        id="auth-card"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4 text-blue-600">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
            HireSense AI
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            AI Resume Screening & Candidate Matching Platform
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 bg-red-50 border border-red-200 p-3 rounded-lg text-red-600 text-xs font-semibold"
            id="auth-error-msg"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-slate-600 text-xs font-bold mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                  id="auth-fullname-input"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-600 text-xs font-bold mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                id="auth-email-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 text-xs font-bold mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                id="auth-password-input"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-slate-600 text-xs font-bold mb-2.5 uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-3" id="role-selector-grid">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.CANDIDATE)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    role === UserRole.CANDIDATE
                      ? "bg-blue-50 border-blue-600 text-blue-600 shadow-sm"
                      : "bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  id="role-candidate-btn"
                >
                  <UserIcon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">Candidate</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Upload and check resumes.</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.RECRUITER)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    role === UserRole.RECRUITER
                      ? "bg-blue-50 border-blue-600 text-blue-600 shadow-sm"
                      : "bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                  id="role-recruiter-btn"
                >
                  <Briefcase className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold">Recruiter</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 font-medium">Post jobs and score matches.</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-all shadow-md shadow-blue-500/15 flex items-center justify-center mt-6"
            id="auth-submit-btn"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isLogin ? (
              "Sign In"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-blue-600 hover:text-blue-700 font-semibold transition-all"
            id="auth-toggle-btn"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>

        {/* Demo Fast Login Panel */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <p className="text-slate-400 text-[10px] text-center font-bold uppercase tracking-widest mb-3">
            Quick Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2" id="demo-logins-grid">
            <button
              onClick={() => fillDemoCreds(UserRole.CANDIDATE)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all text-xs font-semibold shadow-sm"
              id="demo-login-candidate"
            >
              <UserIcon className="w-3.5 h-3.5 text-blue-600" />
              Alex (Candidate)
            </button>
            <button
              onClick={() => fillDemoCreds(UserRole.RECRUITER)}
              className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all text-xs font-semibold shadow-sm"
              id="demo-login-recruiter"
            >
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              Sarah (Recruiter)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
