import React from "react";
import { Sparkles, ShieldCheck, LogOut, Plus, BookOpen, User as UserIcon } from "lucide-react";
import { AuthUserProfile } from "../types";

interface NavbarProps {
  user: AuthUserProfile | null;
  onSignOut: () => void;
  onNewReflection: () => void;
  onOpenThreatModel: () => void;
  isCreatingNew: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignOut,
  onNewReflection,
  onOpenThreatModel,
  isCreatingNew,
}) => {
  return (
    <header className="border-b border-[#E5E3DC] bg-[#FAF9F5]/90 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#9E472A] flex items-center justify-center text-[#FAF9F5] shadow-xs">
            <BookOpen className="w-5 h-5 text-[#FAF9F5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-semibold text-[#1A1A1A] tracking-tight text-lg">ReflectAI</span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[#F3EDE2] text-[#9E472A] rounded-full border border-[#E5D8C5]">
                Gemini 3.6 Flash
              </span>
            </div>
            <p className="text-xs text-[#73716B] hidden sm:block">Private Journaling & Mindful AI Reflections</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {user && (
            <>
              <button
                id="btn-new-reflection"
                onClick={onNewReflection}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all shadow-xs cursor-pointer ${
                  isCreatingNew
                    ? "bg-[#853B23] text-white shadow-[#9E472A]/20 ring-2 ring-[#9E472A]/30"
                    : "bg-[#9E472A] hover:bg-[#853B23] text-white"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>New Reflection</span>
              </button>

              <button
                id="btn-threat-model"
                onClick={onOpenThreatModel}
                title="View Security Threat Model & Protections"
                className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#1A1A1A] bg-[#F3EDE2] hover:bg-[#EADCC9] border border-[#E5E3DC] transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#3E6B48]" />
                <span>Security Model</span>
              </button>
            </>
          )}

          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-[#E5E3DC]">
              <div className="flex items-center space-x-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-full border border-[#DCD9D0] object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#EADCC9] flex items-center justify-center text-[#8C4A2F]">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-[#1A1A1A] truncate max-w-[120px]">
                    {user.displayName || user.email?.split("@")[0] || "Authenticated"}
                  </p>
                  <p className="text-[10px] text-[#73716B] truncate max-w-[120px]">
                    {user.email || "Active User"}
                  </p>
                </div>
              </div>

              <button
                id="btn-signout"
                onClick={onSignOut}
                title="Sign Out"
                className="p-1.5 rounded-lg text-[#73716B] hover:text-[#1A1A1A] hover:bg-[#EAE8E1] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenThreatModel}
              className="flex items-center space-x-1 px-2.5 py-1.5 text-xs text-[#1A1A1A] bg-[#F3EDE2] hover:bg-[#EADCC9] rounded-lg border border-[#E5E3DC] cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#3E6B48]" />
              <span>Security Architecture</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
