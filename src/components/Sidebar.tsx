import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Search,
  BookOpen,
  MessageSquare,
  LogOut,
  Bell,
  Briefcase,
  Layers,
  HelpCircle,
  Menu,
  ChevronLeft,
  UserCheck
} from "lucide-react";
import { UserRole } from "../types";

interface SidebarProps {
  user: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  notificationsCount: number;
  onShowNotifications: () => void;
}

export default function Sidebar({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  notificationsCount,
  onShowNotifications
}: SidebarProps) {
  const isRecruiter = user?.role === UserRole.RECRUITER;

  const recruiterTabs = [
    { id: "dashboard", label: "Analytics Dashboard", icon: LayoutDashboard },
    { id: "jobs", label: "Job Postings", icon: Briefcase },
    { id: "matching", label: "Candidate Screen & Rank", icon: Search },
    { id: "chatbot", label: "AI Recruiter Chatbot", icon: MessageSquare },
  ];

  const candidateTabs = [
    { id: "dashboard", label: "Candidate Dashboard", icon: LayoutDashboard },
    { id: "upload", label: "Upload & Parse Resume", icon: FileText },
    { id: "analysis", label: "AI Resume Analysis", icon: Layers },
    { id: "interview", label: "AI Interview Questions", icon: HelpCircle },
    { id: "career", label: "Tailored Study Plan", icon: BookOpen },
  ];

  const tabs = isRecruiter ? recruiterTabs : candidateTabs;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shadow-sm" id="app-sidebar">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between" id="sidebar-header">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-slate-100 font-mono shadow-md shadow-blue-500/20">
            <UserCheck className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 font-sans tracking-tight leading-none">
              Hire Sense AI
            </h1>
            <span className="text-[10px] text-blue-600 font-bold font-mono tracking-wider uppercase mt-1.5 block">
              TalentIQ AI
            </span>
          </div>
        </div>
      </div>

      {/* Logged User Info */}
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50" id="sidebar-user-info">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 font-sans">
            {user?.fullName ? user.fullName[0] : "U"}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">
              {user?.fullName || "User Account"}
            </h4>
            <span className="text-[10px] text-slate-500 font-medium capitalize mt-0.5 block leading-none">
              {user?.role === UserRole.RECRUITER ? `${user?.fullName || "Recruiter"} (Recruiter)` : "Candidate Workspace"}
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar Tabs */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto" id="sidebar-nav-tabs">
        <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase px-3 mb-2">
          Management
        </p>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-xs font-medium group ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/10"
                  : "text-slate-600 hover:text-slate-950 hover:bg-slate-50"
              }`}
              id={`sidebar-tab-${tab.id}`}
            >
              <Icon className={`w-4 h-4 transition-all ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Operations */}
      <div className="p-4 border-t border-slate-100 space-y-2 bg-slate-50/50" id="sidebar-footer">
        {/* Notifications Trigger */}
        <button
          onClick={onShowNotifications}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-950 hover:bg-slate-50 transition-all group"
          id="sidebar-notifications-trigger"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            <span>Alerts and Logs</span>
          </div>
          {notificationsCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse" id="notif-badge">
              {notificationsCount}
            </span>
          )}
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
          id="sidebar-logout-btn"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
