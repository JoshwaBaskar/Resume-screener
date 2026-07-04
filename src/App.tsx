import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Check, Loader2, X, AlertCircle } from "lucide-react";
import { UserRole, ResumeData, JobDescription, AppNotification } from "./types";
import { api, setAuthToken, getAuthToken } from "./services/api";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import Sidebar from "./components/Sidebar";
import CandidateDashboard from "./components/CandidateDashboard";
import RecruiterDashboard from "./components/RecruiterDashboard";

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchCommonData();
      // Start periodic notifications polling
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const checkAuth = async () => {
    const token = getAuthToken();
    if (!token) {
      setAuthChecking(false);
      return;
    }

    try {
      setAuthToken(token);
      const res = await api.me();
      setUser(res.user);
    } catch (err) {
      console.error("Auth check failed:", err);
      setAuthToken(null);
    } finally {
      setAuthChecking(false);
    }
  };

  const fetchCommonData = async () => {
    try {
      const activeJobs = await api.fetchJobs();
      setJobs(activeJobs);
      await fetchNotifications();
    } catch (err) {
      console.error("Error loading listings:", err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const list = await api.fetchNotifications();
      setNotifications(list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthSuccess = (token: string, authenticatedUser: any) => {
    setAuthToken(token);
    setUser(authenticatedUser);
    setActiveTab("dashboard");
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      setResume(null);
      setNotifications([]);
      setJobs([]);
      setActiveTab("dashboard");
      setShowAuth(false);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await api.markNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4" id="app-loading-screen">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider font-mono animate-pulse">
          Connecting to HireSense AI...
        </p>
      </div>
    );
  }

  if (!user) {
    if (!showAuth) {
      return <LandingPage onNavigateToAuth={() => setShowAuth(true)} />;
    }
    return (
      <div className="relative">
        <div className="absolute top-6 left-6 z-50">
          <button
            onClick={() => setShowAuth(false)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all shadow-md"
          >
            ← Back to Home
          </button>
        </div>
        <AuthPage onAuthSuccess={handleAuthSuccess} apiClient={api} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans" id="app-container">
      {/* App Sidebar panel */}
      <Sidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        notificationsCount={unreadCount}
        onShowNotifications={() => {
          setShowNotificationsModal(true);
          markAllNotificationsAsRead();
        }}
      />

      {/* Main Content Workspace Panel */}
      <main className="flex-1 min-h-screen overflow-y-auto p-8 lg:p-10" id="main-content-panel">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="max-w-6xl mx-auto h-full"
            id={`tab-wrapper-${activeTab}`}
          >
            {user.role === UserRole.RECRUITER ? (
              <RecruiterDashboard
                activeTab={activeTab}
                apiClient={api}
                jobs={jobs}
                setJobs={setJobs}
              />
            ) : (
              <CandidateDashboard
                activeTab={activeTab}
                apiClient={api}
                resume={resume}
                setResume={setResume}
                jobs={jobs}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Notifications Alert Center Dialog Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-4" id="notifications-modal">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Activity Logs and Alerts</h3>
              </div>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-semibold transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List Body */}
            <div className="p-6 overflow-y-auto max-h-[50vh] space-y-4" id="notifications-list">
              {notifications.length === 0 ? (
                <p className="text-slate-400 text-xs py-8 text-center font-medium">No alerts logged yet.</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-4 bg-slate-50/80 border border-slate-100 rounded-xl flex items-start gap-3">
                    <div className="p-1.5 bg-blue-50 border border-blue-100 rounded text-blue-600 mt-0.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{notif.title}</span>
                        <span className="text-[9px] text-slate-400 font-mono font-medium">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-right">
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-blue-500/10"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
